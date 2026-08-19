import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getAuthenticatedUserId(req: NextRequest | Request) {
  const authorization = req.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(authorization.slice(7), process.env.JWT_SECRET!) as {
        userId?: string;
      };
      if (payload.userId) return payload.userId;
    } catch {
      return null;
    }
  }

  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}