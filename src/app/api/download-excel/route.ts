import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import nodemailer from "nodemailer";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, startDate, endDate } = await req.json();

    if (!email || !startDate || !endDate) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch accounts
    const accounts = await Account.find({ userId });
    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        { message: "No accounts found" },
        { status: 404 }
      );
    }

    const wb = XLSX.utils.book_new();

    // For each account → fetch transactions in date range
    for (const acc of accounts) {
      const txs = await Transaction.find({
        accountId: acc._id,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }).lean();

      const income = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expense = txs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      const balance = income - expense;

      // Transactions table first
      const transactionsData = [
        {
          Date: "Date",
          Type: "Type",
          Amount: "Amount",
          Note: "Note",
        },
        ...txs.map((t) => ({
          Date: new Date(t.date).toLocaleDateString(),
          Type: t.type,
          Amount: t.amount,
          Note: t.note || "",
        })),
      ];

      // Add 2 blank rows, then summary
      const summaryData = [
        {},
        { Type: "Income", Amount: income },
        { Type: "Expense", Amount: expense },
        { Type: "Balance", Amount: balance },
      ];

      // Merge transactions + summary
      const data = [...transactionsData, ...summaryData];

      const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
      XLSX.utils.book_append_sheet(wb, ws, acc.name.substring(0, 30));
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Email Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Beautiful HTML template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#4CAF50;">📊 TrackIt Transactions Report</h2>
        <p>Dear user,</p>
        <p>Please find attached your <b>transactions report</b> from 
          <b>${new Date(startDate).toLocaleDateString()}</b> to 
          <b>${new Date(endDate).toLocaleDateString()}</b>.
        </p>
        <p>Each sheet in the Excel file contains:</p>
        <ul>
          <li><b>Income</b> (green) – total earnings</li>
          <li><b>Expense</b> (red) – total spendings</li>
          <li><b>Balance</b> – net balance</li>
          <li>All transactions listed in a table</li>
        </ul>
        <p style="margin-top:20px;">Thank you for using <b>TrackIt</b> 🚀</p>
        <p style="font-size:12px; color: #888;">This is an automated email, please do not reply.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"TrackIt Reports" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "📌 Your TrackIt Transactions Report",
      html: htmlTemplate,
      attachments: [
        {
          filename: `TrackIt_Report_${startDate}_to_${endDate}.xlsx`,
          content: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { message: "Failed to send Excel" },
      { status: 500 }
    );
  }
}
