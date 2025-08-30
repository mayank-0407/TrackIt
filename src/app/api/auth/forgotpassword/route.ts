import { connectDB } from "@/lib/db";
import { generateEmailToken } from "@/lib/emailToken";
import { sendForgotPasswordEmail } from "@/lib/sendForgotPasswordEmail";
import { ForgotPasswordSchema } from "@/lib/Validation";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email } = parsed.data;

    await connectDB();

    const thisUser = await User.findOne({ email: email });

    if (!thisUser)
      return NextResponse.json(
        { error: "User Not Fround with This Email : " + email },
        { status: 404 }
      );

    const token = generateEmailToken(email);
    const resetUrl = `${process.env.BASE_URL}/forgotpassword/reset?token=${token}`;

    await sendForgotPasswordEmail(email, resetUrl);

    return NextResponse.json(
      { message: "Forgot Password email sent" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
