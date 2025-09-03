"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DownloadModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!email || !startDate || !endDate) {
      toast.error("Please enter email and both dates");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/download-excel", {
        email,
        startDate,
        endDate,
      });
      if (res.status === 200) {
        toast.success("Excel report sent to your email!");
        onClose();
      }
    } catch (error: any) {
      console.error("Error sending Excel:", error);
      toast.error(error.response?.data?.message || "Failed to send Excel file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Transactions on Mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? "Sending..." : "Send Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
