"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Account = {
  _id: string;
  name: string;
  accountNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [revealed, setRevealed] = useState<
    Record<string, Record<string, string>>
  >({}); // { accountId: { field: value } }

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get("/api/accounts");
        setAccounts(res.data.accounts);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleReveal = async (accountId: string, field: string) => {
    try {
      const res = await axios.post("/api/accounts/reveal", {
        accountId,
        field,
      });
      setRevealed((prev) => ({
        ...prev,
        [accountId]: {
          ...prev[accountId],
          [field]: res.data.value,
        },
      }));
    } catch (err) {
      console.error("Error revealing field:", err);
    }
  };

  const handleHide = (accountId: string, field: string) => {
    setRevealed((prev) => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [field]: "",
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {accounts.map((account) => (
        <Card key={account._id} className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>{account.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["accountNumber", "cardNumber", "expiryDate", "cvv"].map(
              (field) => (
                <div key={field} className="flex justify-between items-center">
                  <span className="font-medium capitalize">{field}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {revealed[account._id]?.[field] || "••••••••"}
                    </span>
                    {revealed[account._id]?.[field] ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleHide(account._id, field)}
                      >
                        Hide
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleReveal(account._id, field)}
                      >
                        Reveal
                      </Button>
                    )}
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
