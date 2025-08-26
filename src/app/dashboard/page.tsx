"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionSchema } from "@/lib/Validation";
import AddTransactionModal from "@/components/AddTransactionModal";
import AddAccountModal from "@/components/AddAccountModal";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Transaction = {
  _id: string;
  accountId: { _id: string; name: string; type: string };
  categoryId: string;
  type: "expense" | "income" | "transfer";
  amount: number;
  note?: string;
  date: string;      
  createdAt: string;  
  updatedAt?: string;  
  userId?: string;     
};


type Account = { _id: string; name: string; type: string };

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // summary states
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // account balances state
  const [accountSummary, setAccountSummary] = useState<
    { accountId: string; name: string; type: string; net: number }[]
  >([]);

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/accounts");
      setAccounts(res.data.accounts || []);
    } catch (error: any) {
      console.error("Error fetching accounts:", error);
      toast.error(error.response?.data?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/transactions", {
        params: {
          accountId: filterAccount !== "all" ? filterAccount : undefined,
        },
      });
      const txs: Transaction[] = res.data.transactions || [];
      console.log(txs);
      txs.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }

        const createdA = new Date(a.createdAt);
        const createdB = new Date(b.createdAt);
        return createdB.getTime() - createdA.getTime();
      });

      setTransactions(txs);

      // calculate summary for current month
      const currentMonth = new Date().getMonth();
      const filtered = txs.filter(
        (t) => new Date(t.date).getMonth() === currentMonth
      );

      const inc = filtered
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const exp = filtered
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      setIncome(inc);
      setExpenses(exp);
      setBalance(inc - exp);

      // account-wise net calculation including accounts with no transactions
      const accSummary: {
        [key: string]: { name: string; type: string; net: number };
      } = {};

      // initialize all accounts with 0 net
      accounts.forEach((acc) => {
        accSummary[acc._id] = {
          name: acc.name,
          type: acc.type,
          net: 0,
        };
      });

      // calculate net for accounts with transactions
      filtered.forEach((t) => {
        if (t.type === "income") {
          accSummary[t.accountId._id].net += t.amount;
        } else if (t.type === "expense") {
          accSummary[t.accountId._id].net -= t.amount;
        }
      });

      setAccountSummary(
        Object.keys(accSummary).map((id) => ({
          accountId: id,
          name: accSummary[id].name,
          type: accSummary[id].type,
          net: accSummary[id].net,
        }))
      );
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error(
        error.response?.data?.message || "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add transaction
  const handleAddTransaction = async (data: any) => {
    try {
      const parsed = TransactionSchema.parse(data);
      const res = await axios.post("/api/transactions", parsed);
      setTransactions((prev) => [res.data.transaction, ...prev]);
      toast.success("Transaction added successfully");
      setIsModalOpen(false);
      fetchTransactions(); // refresh summary after new transaction
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast.error(error.response?.data?.message || "Failed to add transaction");
    }
  };

  // Add account
  const handleAddAccount = async (data: { name: string; type: string }) => {
    try {
      const res = await axios.post("/api/accounts", data);
      setAccounts((prev) => [...prev, res.data.account]);
      toast.success("Account added successfully");
      setIsAccountModalOpen(false);
      fetchTransactions(); // refresh account summary
    } catch (error: any) {
      console.error("Error adding account:", error);
      toast.error(error.response?.data?.message || "Failed to add account");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [accounts, filterAccount]);

  // chart data
  const chartData = [
    { name: "Income", value: income },
    { name: "Expenses", value: expenses },
  ];
  const COLORS = ["#4CAF50", "#F44336"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAccountModalOpen(true)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              + Add Account
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              + Add Transaction
            </Button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-600">Income</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹{income.toLocaleString()}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600">Expenses</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹{expenses.toLocaleString()}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-600">Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ₹{balance.toLocaleString()}
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Account Summary (This Month)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountSummary.map((acc) => (
              <Card key={acc.accountId} className="shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{acc.name}</h3>
                    <p className="text-sm text-gray-500">{acc.type}</p>
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      acc.net >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {acc.net >= 0 ? "+" : "-"}₹
                    {Math.abs(acc.net).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={transactions}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).getDate().toString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <label className="font-medium text-gray-700">
            Filter by Account:
          </label>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <p className="text-gray-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Account</th>
                  <th className="px-4 py-2 text-left">Note</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td
                      className={`px-4 py-2 font-medium ${
                        tx.type === "income"
                          ? "text-green-600"
                          : tx.type === "expense"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {tx.type}
                    </td>
                    <td className="px-4 py-2">₹{tx.amount}</td>
                    <td className="px-4 py-2">{tx.accountId.name}</td>
                    <td className="px-4 py-2">{tx.note || "N/A"}</td>
                    <td className="px-4 py-2">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
        accounts={accounts}
      />
      <AddAccountModal
        open={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleAddAccount}
      />
    </div>
  );
}
