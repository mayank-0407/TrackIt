import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import { AccountSchema } from "@/lib/Validation";
import { encrypt } from "@/lib/encryption";
import { getAuthenticatedUserId } from "@/lib/mobileAuth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = AccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = {
      ...parsed.data,
      accountNumber: parsed.data.accountNumber
        ? encrypt(parsed.data.accountNumber)
        : undefined,
      cardNumber: parsed.data.cardNumber
        ? encrypt(parsed.data.cardNumber)
        : undefined,
      cvv: parsed.data.cvv ? encrypt(parsed.data.cvv) : undefined,
      userId,
    };

    const account = await Account.create(data);

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Account creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accounts = await Account.find({ userId });
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
