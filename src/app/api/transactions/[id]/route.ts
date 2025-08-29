import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const transaction = await Transaction.findOne({ _id: id });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const thisAccount = await Account.findOne({ _id: transaction.accountId });

    if (transaction.type === "income") {
      thisAccount.balance -= transaction.amount;
      thisAccount.save();
    } else if (transaction.type === "expense") {
      thisAccount.balance += transaction.amount;
      thisAccount.save();
    } else if (transaction.type === "transfer") {
      const transferAccount = await Account.findOne({
        _id: transaction.transferAccountId,
      });

      transferAccount.balance -= transaction.amount;
      transferAccount.save();

      thisAccount.balance += transaction.amount;
      thisAccount.save();
    }

    await Transaction.deleteOne({ _id: transaction._id });

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (err: any) {
    console.error("Error deleting Transaction:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
