import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

const founderSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  role: z.string().trim().min(2).max(120),
  isPrimary: z.boolean().optional(),
});

const supportInterestSchema = z.enum([
  "OFFICE_SPACE",
  "TRAINING",
  "FUNDING",
  "MENTORSHIP",
  "NETWORKING",
  "MARKET_ACCESS",
  "LEGAL_SUPPORT",
  "PRODUCT_DEVELOPMENT",
  "INVESTMENT_READINESS",
  "OTHER",
]);

const baseApplicationSchema = z.object({
  companyName: z.string().trim().min(2).max(200).optional(),
  sector: z.string().trim().min(2).max(100).optional(),
  stage: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(20).max(5000).optional(),
  teamSize: z.coerce.number().int().positive().max(100000).optional(),
  supportInterests: z.array(supportInterestSchema).max(10).optional(),
  founders: z.array(founderSchema).max(3).optional(),
});

export const createApplicationSchema = baseApplicationSchema.extend({
  status: z.enum([ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED]).optional(),
});

export const updateApplicationSchema = baseApplicationSchema;

export const listApplicationQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  status: z
    .enum([
      ApplicationStatus.DRAFT,
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED,
    ])
    .optional(),
});
