import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY =
  process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(SECRET_KEY, "base64");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(hash: string): string {
  const [ivHex, encryptedHex] = hash.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const key = Buffer.from(SECRET_KEY, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString();
}
