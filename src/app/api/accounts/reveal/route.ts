import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Account from "@/models/Account";
import { decrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId, field } = await req.json();
    const account = await Account.findById(accountId);

    if (!account || account.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!["accountNumber", "cardNumber", "expiryDate", "cvv"].includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const encryptedValue = account[field];
    if (!encryptedValue) {
      return NextResponse.json(
        { error: "Field not available" },
        { status: 404 }
      );
    }

    let value: string;
    try {
      value = decrypt(encryptedValue);
    } catch (e) {
      console.error("Decryption error", e);
      return NextResponse.json(
        { error: "Failed to decrypt value" },
        { status: 500 }
      );
    }

    return NextResponse.json({ value }, { status: 200 });
  } catch (err) {
    console.error("Reveal error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
