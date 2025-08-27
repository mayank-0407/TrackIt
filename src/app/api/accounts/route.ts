import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import { AccountSchema } from "@/lib/Validation";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { encrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = AccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
      userId: session.user.id,
    };

    const account = await Account.create(data);

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Account creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const accounts = await Account.find({ userId });
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
