import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { LoginSchema } from "@/lib/Validation";

export async function POST(req: Request) {
  try {
    const parsed = LoginSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    await connectDB();
    const email = parsed.data.email.trim().toLowerCase();
    const user: any = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }
    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 403 });
    }

    const token = jwt.sign(
      { userId: String(user._id), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      token,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}