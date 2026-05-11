import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { TransactionSchema } from "@/lib/Validation";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import Account from "@/models/Account";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const parsed =
      TransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error,
        },
        {
          status: 400,
        }
      );
    }

    const session: any =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const thisAccount =
      await Account.findOne({
        _id: parsed.data.accountId,
      });

    let transferAccountId:
      | string
      | undefined;

    const transactionType =
      parsed.data.type;

    if (
      transactionType ===
      "expense"
    ) {
      thisAccount.balance -=
        parsed.data.amount;

      await thisAccount.save();
    } 
    else if (
      transactionType ===
      "income"
    ) {
      thisAccount.balance +=
        parsed.data.amount;

      await thisAccount.save();
    } 
    else if (
      transactionType ===
      "transfer"
    ) {
      if (
        parsed.data.accountId ===
        parsed.data
          .transferAccountId
      ) {
        return NextResponse.json(
          {
            error:
              "Cannot transfer to same account",
          },
          {
            status: 203,
          }
        );
      }

      thisAccount.balance -=
        parsed.data.amount;

      await thisAccount.save();

      const transferAccount =
        await Account.findOne({
          _id: parsed.data
            .transferAccountId,
        });

      transferAccountId =
        transferAccount._id.toString();

      transferAccount.balance +=
        parsed.data.amount;

      await transferAccount.save();
    }

    const transaction =
      await Transaction.create({
        accountId:
          parsed.data.accountId,

        type:
          parsed.data.type,

        amount:
          parsed.data.amount,

        note:
          parsed.data.note,

        date:
          parsed.data.date,

        userId:
          session.user.id,

        // category only for non-transfer
        categoryId:
          parsed.data.type !==
          "transfer"
            ? parsed.data
                .categoryId
            : null,

        // transfer only for transfer
        transferAccountId:
          parsed.data.type ===
          "transfer"
            ? transferAccountId
            : null,
      });

    const populatedTransaction =
      await Transaction.findById(
        transaction._id
      )
        .populate("accountId")
        .populate("categoryId");

    return NextResponse.json(
      {
        transaction:
          populatedTransaction,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Transaction creation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const session: any = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { searchParams } = new URL(req.url);

    const accountId = searchParams.get("accountId");

    const filter: Record<string, any> = {
      userId, // 🔥 ALWAYS FIRST FILTER
    };

    if (accountId && accountId !== "all") {
      filter.accountId = accountId;
    }

    const transactions = await Transaction.find(filter)
      .populate("accountId")
      .populate("categoryId")
      .sort({ date: -1 });

    return NextResponse.json(
      { transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch transactions error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}