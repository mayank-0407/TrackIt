import { z } from "zod";

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

  _id: z.string(),
  userId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Account = z.infer<typeof AccountSchema>;
