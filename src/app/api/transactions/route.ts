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

    const parsed = TransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await Transaction.create({
      ...parsed.data,
      userId: session.user.id,
    });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    const filter: Record<string, any> = {};
    if (accountId && accountId !== "all") filter.accountId = accountId;

    const transactions = await Transaction.find(filter).populate("accountId");

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
