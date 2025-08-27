import jwt from "jsonwebtoken";

export function generateEmailToken(email: string) {
  console.log(email);
  return jwt.sign(
    { email, exp: Math.floor(Date.now() / 1000) + 60 * 3 }, // 3 mins expiry
    process.env.JWT_SECRET!
  );
}

export function verifyEmailToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
  } catch {
    return null;
  }
}
