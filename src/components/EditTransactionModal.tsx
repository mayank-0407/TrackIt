"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type EditTransactionModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  accounts: { _id: string; name: string }[];
  transaction: {
    _id: string;
    accountId: { _id: string; name: string };
    type: "expense" | "income" | "transfer";
    amount: number;
    note?: string;
    date: string;
    transferAccountId?: string;
  } | null;
};

export default function EditTransactionModal({
  open,
  onClose,
  onSubmit,
  accounts,
  transaction,
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    accountId: "",
    type: "expense",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    transferAccountId: "",
  });

  // Prefill data when modal opens with a transaction
  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId._id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        note: transaction.note || "",
        date: transaction.date.split("T")[0],
        transferAccountId: transaction.transferAccountId || "",
      });
    }
  }, [transaction]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success("Transaction updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Error in EditTransactionModal:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Dropdown */}
          <div>
            <Label>Account</Label>
            <select
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select an account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <Label>Type</Label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
            />
          </div>

          {/* Note */}
          <div>
            <Label>Note</Label>
            <Input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Optional note"
            />
          </div>

          {/* Date */}
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          {formData.type === "transfer" ? (
            <div>
              <Label>Transfer Account</Label>
              <select
                name="transferAccountId"
                value={formData.transferAccountId}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a Transfer account</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
