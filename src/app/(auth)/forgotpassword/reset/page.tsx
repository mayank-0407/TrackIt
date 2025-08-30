"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import jwt from "jsonwebtoken";

export default function Reset() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thisUserEmail, setThisUserEmail] = useState("");
  const [thisExpired, setThisExpired] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    if (thisExpired) {
      toast.error("This Link has been Expired Please generate a new link");
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData(e.currentTarget);
      if (formData.get("password") != formData.get("confirmPassword")) {
        toast.error("Both Passowrds Should be Same!");
        setLoading(false);
        return;
      }

      const res = await axios.post("/api/auth/forgotpassword/reset", {
        email: thisUserEmail,
        password: formData.get("password"),
      });

      if (res?.status === 200) {
        toast.success("Password Reset Successfull");
        router.push("/login");
      } else toast.error(res?.data.error);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        toast.error("Invalid or missing token.");
        throw new Error("Invalid or missing token.");
      }

      try {
        const decoded: any = jwt.decode(token);
        setThisUserEmail(decoded.email);
        if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
          setThisExpired(true);
          throw new Error(
            "This Link has been Expired Please generate a new link"
          );
        }
      } catch (err: any) {
        toast.error(err);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-[400px] shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            TrackIt Reset Password!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              name="email"
              placeholder={thisUserEmail}
              type="email"
              value={thisUserEmail}
              disabled
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
            />
            <Input
              name="confirmPassword"
              placeholder="Confirm Password"
              type="password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Want to Do direct login?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Click Here
            </a>
          </p>
          <p className="mt-2 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
