import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .regex(passwordRegex, "Password must contain at least one uppercase letter and one number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
