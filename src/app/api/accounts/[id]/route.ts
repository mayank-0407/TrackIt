import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import { encrypt } from "@/lib/encryption";
import { AccountSchema } from "@/lib/Validation";
import { getAuthenticatedUserId } from "@/lib/mobileAuth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const account = await Account.findOne({ _id: id, userId });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(account, { status: 200 });
  } catch (err: any) {
    console.error("❌ Error fetching account:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const account = await Account.findOneAndDelete({ _id: id, userId });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Account deleted" });
  } catch (err: any) {
    console.error("Error deleting account:", err);
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

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = AccountSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const updateData: any = { ...parsed.data };
    if (parsed.data.accountNumber) {
      updateData.accountNumber = encrypt(parsed.data.accountNumber);
    }
    if (parsed.data.cardNumber) {
      updateData.cardNumber = encrypt(parsed.data.cardNumber);
    }
    if (parsed.data.cvv) {
      updateData.cvv = encrypt(parsed.data.cvv);
    }

    const updatedAccount = await Account.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true } 
    );

    if (!updatedAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, account: updatedAccount },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error updating account:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
