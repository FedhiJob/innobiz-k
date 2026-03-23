import { z } from "zod";

export const createMonthlyReportSchema = z.object({
  headline: z.string().min(3, "Headline must be at least 3 characters.").max(120),
  description: z.string().min(20, "Description must be at least 20 characters.").max(2000),
  reportMonth: z.string().optional(),
});
