"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: string }) => void;
};

export default function AddAccountModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("other");

  const handleSubmit = () => {
    if (!name) return;
    onSubmit({ name, type });
    setName("");
    setType("Savings");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="other">Other</option>
            <option value="bank">Bank</option>
            <option value="wallet">Wallet</option>
            <option value="credit">Credit Card</option>
          </select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="bg-green-600 text-white" onClick={handleSubmit}>
              Add Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
