import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["cash", "bank", "credit", "other"]).default("other"),
  currency: z.string().default("INR"),
  balance: z.number().default(0),

  // Bank
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),

  // Credit Card fields
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

export const TransactionSchema = z.object({
  accountId: z.string(),
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive(),
  note: z.string().optional(),
  date: z.coerce.date(),
});

export type Account = z.infer<typeof AccountSchema>;