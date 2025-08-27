import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
    };

    await connectDB();
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: "Already verified" });
    }

    user.isVerified = true;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
}
