import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ForgotPasswordSchema } from "@/lib/Validation";
import { sendPasswordChangedConfirmation } from "@/lib/sendForgotPasswordConfirmation";
import { verifyEmailToken } from "@/lib/emailToken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const token = (body as any).token;

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    const decoded = verifyEmailToken(token);
    if (!decoded || decoded.email !== email) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await connectDB();

    const thisUser = await User.findOne({ email });
    if (!thisUser) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password!, 10);
    thisUser.password = hashed;
    await thisUser.save();

    const baseUrl = process.env.BASE_URL!;
    await sendPasswordChangedConfirmation(email, baseUrl);

    return NextResponse.json({
      success: true,
      message: "Password Has been Changed!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
