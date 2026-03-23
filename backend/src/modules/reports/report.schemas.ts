import { z } from "zod";

export const monthlyReportShareSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  expiresInDays: z.coerce.number().int().positive().max(90).optional(),
});

export const monthlyReportEmailSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
  format: z.enum(["pdf", "docx", "txt", "csv"]).default("pdf"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  expiresInDays: z.coerce.number().int().positive().max(90).optional(),
});
