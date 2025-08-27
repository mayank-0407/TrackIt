import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateEmailToken } from "@/lib/emailToken";
import { sendEmail } from "@/lib/sendEmail";
import { sendEmailVerification } from "@/lib/sendEmailVerification";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await connectDB();
    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.isVerified)
      return NextResponse.json({ message: "Already verified" });

    const token = generateEmailToken(email);
    const verifyUrl = `${process.env.BASE_URL}/verify?token=${token}`;

    await sendEmailVerification(email,verifyUrl);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
