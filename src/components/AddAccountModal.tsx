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
  onSubmit: (data: {
    name: string;
    type: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  }) => void;
};

export default function AddAccountModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("other");

  // Bank fields
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  // Credit card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = () => {
    if (!name) return;

    onSubmit({
      name,
      type,
      bankName: bankName || undefined,
      accountNumber: accountNumber || undefined,
      ifscCode: ifscCode || undefined,
      cardNumber: cardNumber || undefined,
      expiryDate: expiryDate || undefined,
      cvv: cvv || undefined,
    });

    // reset fields
    setName("");
    setType("other");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Name */}
          <input
            type="text"
            placeholder="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="other">Other</option>
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit Card</option>
          </select>

          {/* Show Bank Fields */}
          {type === "bank" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Bank Name (optional)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Account Number (optional)"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="IFSC Code (optional)"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Show Credit Card Fields */}
          {type === "credit" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Card Number (optional)"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Expiry Date (MM/YY) (optional)"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="CVV (optional)"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Actions */}
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
