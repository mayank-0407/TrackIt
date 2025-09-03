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
import AccountDetailsModal from "@/components/AccountDetailsModal";
import { Account } from "@/lib/account";
import EditTransactionModal from "@/components/EditTransactionModal";
import { Download } from "lucide-react";
import DownloadModal from "@/components/DownloadModal";

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

  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);

  // account balances state
  const [accountSummary, setAccountSummary] = useState<
    { accountId: string; name: string; type: string; net: number }[]
  >([]);

  // selected account for modal
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [dateFilter, setDateFilter] = useState<string>("last30");
  const [customRange, setCustomRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const filterByDate = (txs: Transaction[]) => {
    const now = new Date();
    let start: Date;

    switch (dateFilter) {
      case "last10":
        start = new Date();
        start.setDate(now.getDate() - 10);
        break;
      case "last20":
        start = new Date();
        start.setDate(now.getDate() - 20);
        break;
      case "last30":
        start = new Date();
        start.setDate(now.getDate() - 30);
        break;
      case "last60":
        start = new Date();
        start.setDate(now.getDate() - 60);
        break;
      case "custom":
        if (customRange?.start && customRange?.end) {
          const startDate = new Date(customRange.start);
          const endDate = new Date(customRange.end);
          return txs.filter(
            (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
          );
        }
        return txs;
      default:
        return txs; // no filter = return all
    }

    return txs.filter((t) => new Date(t.date) >= start);
  };

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

      let txs: Transaction[] = res.data.transactions || [];
      txs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(txs);

      // 🔹 Apply date filter on the frontend
      let filteredTxs = filterByDate(txs);

      // 🔹 Calculate summary from filtered transactions
      const inc = filteredTxs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const exp = filteredTxs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      setIncome(inc);
      setExpenses(exp);
      setBalance(inc - exp);
    } catch (error: any) {
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
      if (res.status === 201) {
        setTransactions((prev) => [res.data.transaction, ...prev]);
        toast.success("Transaction added successfully");
        setIsModalOpen(false);
        fetchTransactions();
      } else if (res.status === 203) {
        toast.error(res.data.error);
      }
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast.error(error.response?.data?.message || "Failed to add transaction");
    }
  };

  const handleDeleteTransaction = async (transactionId: any) => {
    setDeletingTransactionId(transactionId);
    try {
      await axios.delete(`/api/transactions/${transactionId}`);
      toast.success("Transaction deleted successfully");
      setTransactions((prev) => prev.filter((tx) => tx._id !== transactionId));
    } catch (err) {
      console.error("Error deleting Transaction:", err);
      toast.error("Failed to delete transaction");
    } finally {
      setDeletingTransactionId(null);
    }
  };

  // Add account
  const handleAddAccount = async (data: { name: string; type: string }) => {
    try {
      const res = await axios.post("/api/accounts", data);
      setAccounts((prev) => [...prev, res.data.account]);
      toast.success("Account added successfully");
      setIsAccountModalOpen(false);
      fetchTransactions();
    } catch (error: any) {
      console.error("Error adding account:", error);
      toast.error(error.response?.data?.message || "Failed to add account");
    }
  };

  const confirmDelete = (id: string) => {
    toast.warning("Are you sure you want to delete this transaction?", {
      action: {
        label: "Delete",
        onClick: () => handleDeleteTransaction(id),
      },
    });
  };

  const handleEditTransaction = async (data: any) => {
    if (!editingTransaction) return;
    try {
      const res = await axios.put(
        `/api/transactions/${editingTransaction._id}`,
        data
      );
      if (res.status === 200) {
        setTransactions((prev) =>
          prev.map((tx) =>
            tx._id === editingTransaction._id ? res.data.transaction : tx
          )
        );
        setIsEditModalOpen(false);
        setEditingTransaction(null);
        fetchTransactions();
      }
    } catch (error: any) {
      console.error("Error editing transaction:", error);
      toast.error(
        error.response?.data?.message || "Failed to edit transaction"
      );
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchTransactions();
    }
  }, [accounts, filterAccount, dateFilter, customRange]);

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
            Account's Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <Card
                key={acc._id}
                className="shadow-sm p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  const account =
                    accounts.find((a) => a._id === acc._id) || null;
                  setSelectedAccount(account);
                  setIsAccountDetailsOpen(true);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{acc.name}</h3>
                    <p className="text-sm text-gray-500">{acc.type}</p>
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      acc.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {acc.balance >= 0 ? "+" : "-"}₹
                    {Math.abs(acc.balance).toLocaleString()}
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
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <label className="font-medium">Filter by Account:</label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium">Filter by Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="last10">Last 10 Days</option>
              <option value="last20">Last 20 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="last60">Last 2 Months</option>
              <option value="custom">Custom</option>
            </select>
            {dateFilter === "custom" && (
              <div className="flex gap-2">
                <input
                  type="date"
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      start: e.target.value,
                      end: prev?.end ?? "",
                    }))
                  }
                  className="border rounded-md px-2 py-1"
                />
                <input
                  type="date"
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      start: prev?.start ?? "",
                      end: e.target.value,
                    }))
                  }
                  className="border rounded-md px-2 py-1"
                />
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
          </Button>
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
                  <th className="px-4 py-2 text-left">Actions</th>
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
                    <td className="px-4 py-2 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => confirmDelete(tx._id)}
                        disabled={deletingTransactionId === tx._id}
                      >
                        {deletingTransactionId === tx._id
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
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
      <AccountDetailsModal
        open={isAccountDetailsOpen}
        onClose={() => setIsAccountDetailsOpen(false)}
        account={selectedAccount}
      />
      <EditTransactionModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleEditTransaction}
        accounts={accounts}
        transaction={editingTransaction}
      />
      <DownloadModal
        open={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
