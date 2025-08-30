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

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    const transaction = await Transaction.findOne({ _id: id });
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const oldAccount = await Account.findOne({ _id: transaction.accountId });
    if (transaction.type === "income") {
      oldAccount.balance -= transaction.amount;
      await oldAccount.save();
    } else if (transaction.type === "expense") {
      oldAccount.balance += transaction.amount;
      await oldAccount.save();
    } else if (transaction.type === "transfer") {
      const oldTransferAccount = await Account.findOne({
        _id: transaction.transferAccountId,
      });

      if (oldTransferAccount) {
        oldTransferAccount.balance -= transaction.amount;
        await oldTransferAccount.save();
      }

      oldAccount.balance += transaction.amount;
      await oldAccount.save();
    }

    transaction.accountId = body.accountId;
    transaction.type = body.type;
    transaction.amount = body.amount;
    transaction.note = body.note;
    transaction.date = body.date;
    transaction.transferAccountId = body.transferAccountId || null;

    await transaction.save();

    const newAccount = await Account.findOne({ _id: transaction.accountId });
    if (transaction.type === "income") {
      newAccount.balance += transaction.amount;
      await newAccount.save();
    } else if (transaction.type === "expense") {
      newAccount.balance -= transaction.amount;
      await newAccount.save();
    } else if (transaction.type === "transfer") {
      const newTransferAccount = await Account.findOne({
        _id: transaction.transferAccountId,
      });

      if (newTransferAccount) {
        newTransferAccount.balance += transaction.amount;
        await newTransferAccount.save();
      }

      newAccount.balance -= transaction.amount;
      await newAccount.save();
    }

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    console.error("Error updating Transaction:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
