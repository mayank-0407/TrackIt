import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { SignUpSchema } from "@/lib/Validation";
import Account from "@/models/Account";
import jwt from "jsonwebtoken";
import { sendEmailVerification } from "@/lib/sendEmailVerification";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const defaultAccount = new Account({
      userId: user._id,
      name: "Cash",
      type: "cash",
      balance: 0,
    });
    await defaultAccount.save();

    const token = jwt.sign(
      { email, exp: Math.floor(Date.now() / 1000) + 3 * 60 },
      process.env.JWT_SECRET!
    );

    const verifyUrl = `${process.env.BASE_URL}/verify?token=${token}`;

    await sendEmailVerification(email, verifyUrl);

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
