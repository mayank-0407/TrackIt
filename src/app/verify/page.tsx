"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import jwt from "jsonwebtoken";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setMessage("Invalid or missing token.");
        setStatus("error");
        return;
      }

      try {
        const decoded: any = jwt.decode(token);
        if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
          setMessage("Link expired. Please login to resend verification.");
          setStatus("error");
          return;
        }

        const res = await axios.get(`/api/auth/verifyEmail?token=${token}`);
        if (res.data.success) {
          setMessage("✅ Email verified successfully! You can now login.");
          setStatus("success");
        } else {
          setMessage("❌ " + res.data.error);
          setStatus("error");
        }
      } catch {
        setMessage("Something went wrong. Please try again.");
        setStatus("error");
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-[400px] shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">TrackIt</CardTitle>
          <p className="text-center text-sm text-gray-500">
            Email Verification
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p
            className={`${
              status === "success"
                ? "text-green-600"
                : status === "error"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {message}
          </p>

          {status === "success" && (
            <Button className="w-full" asChild>
              <a href="/login">Go to Login</a>
            </Button>
          )}

          {status === "error" && (
            <Button variant="outline" className="w-full" asChild>
              <a href="/signup">Back to Signup</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
