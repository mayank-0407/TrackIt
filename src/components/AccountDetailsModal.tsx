"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // optional if you use toast notifications

import { Account } from "@/lib/account";

type Props = {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onDeleted?: (id: string) => void; // parent can refresh after delete
};

export default function AccountDetailsModal({
  open,
  onClose,
  account,
  onDeleted,
}: Props) {
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState(false);

  if (!account) return null;

  const handleReveal = async (field: string) => {
    try {
      const res = await axios.post("/api/accounts/reveal", {
        accountId: account._id,
        field,
      });
      setRevealed((prev) => ({
        ...prev,
        [field]: res.data.value,
      }));
    } catch (err) {
      console.error("Error revealing field:", err);
    }
  };

  const handleHide = (field: string) => {
    setRevealed((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      setDeleting(true);
      await axios.delete(`/api/accounts/${account._id}`);
      toast.success("Account deleted successfully");
      onDeleted?.(account._id);
      onClose();
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  // 🔹 Decide which fields to show
  let fields: { key: keyof Account; label: string; sensitive?: boolean }[] = [];

  if (account.type === "credit") {
    fields = [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "cardNumber", label: "Card Number", sensitive: true },
      { key: "expiryDate", label: "Expiry Date" },
      { key: "cvv", label: "CVV", sensitive: true },
      { key: "balance", label: "Balance" },
    ];
  } else if (account.type === "bank") {
    fields = [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "bankName", label: "Bank Name" },
      { key: "accountNumber", label: "Account Number", sensitive: true },
      { key: "ifscCode", label: "IFSC Code" },
      { key: "balance", label: "Balance" },
    ];
  } else {
    fields = [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "balance", label: "Balance" },
    ];
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {account.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fields.map(({ key, label, sensitive }) => {
            const value = account[key];
            const isRevealed = revealed[key as string];

            return (
              <div
                key={key as string}
                className="flex justify-between items-center"
              >
                <span className="font-medium">{label}</span>

                {sensitive ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {isRevealed || "••••••••"}
                    </span>
                    {isRevealed ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleHide(key as string)}
                      >
                        Hide
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleReveal(key as string)}
                      >
                        Reveal
                      </Button>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-700 font-medium">
                    {key === "balance" && typeof value === "number"
                      ? `₹${value.toLocaleString()}`
                      : value instanceof Date
                      ? value.toLocaleDateString()
                      : value || "N/A"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 🔹 Delete Button */}
        <div className="pt-6 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
