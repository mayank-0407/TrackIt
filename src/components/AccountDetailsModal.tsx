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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Account } from "@/lib/account";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onDeleted?: (id: string) => void;
  onUpdated?: (account: Account) => void;
};

export default function AccountDetailsModal({
  open,
  onClose,
  account,
  onDeleted,
  onUpdated,
}: Props) {
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Account>>({});

  if (!account) return null;

  const handleReveal = async (field: string) => {
    try {
      const res = await axios.post("/api/accounts/reveal", {
        accountId: account._id,
        field,
      });
      console.log(res);
      if (res.status === 204) toast.error(res.data.error);
      setRevealed((prev) => ({
        ...prev,
        [field]: res.data.value,
      }));
    } catch (err: any) {
      console.error("Error revealing field:", err.response.data.error);
      toast.error(err.response.data.error);
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

  const handleEditSave = async () => {
    try {
      setEditingSubmitting(true);
      const res = await axios.put(`/api/accounts/${account._id}`, formData);
      toast.success("Account updated successfully");
      onUpdated?.(res.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating account:", err);
      toast.error("Failed to update account");
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleFieldChange = (key: keyof Account, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {account.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fields.map(({ key, label, sensitive }) => {
            const value = formData[key] ?? account[key];
            const isRevealed = revealed[key as string];

            return (
              <div
                key={key as string}
                className="flex justify-between items-center"
              >
                <span className="font-medium">{label}</span>

                {editing ? (
                  <div className="flex items-center gap-2">
                    {key === "accountNumber" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Info size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>
                              Remove this and enter a new account number if you
                              want to update.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Input
                      className="w-40"
                      value={value as any}
                      type={typeof value === "number" ? "number" : "text"}
                      onChange={(e) =>
                        handleFieldChange(
                          key,
                          typeof value === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                    />
                  </div>
                ) : sensitive ? (
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

        <div className="pt-6 flex justify-end gap-2">
          {editing ? (
            <>
              <Button onClick={() => handleEditSave()}>
                {editingSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(account);
                  setEditing(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
