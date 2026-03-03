import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

export const adminListQuerySchema = z.object({
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
  search: z.string().trim().min(2).optional(),
});

export const approveSchema = z.object({
  adminNotes: z.string().trim().min(2).max(2000).optional(),
});

export const rejectSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(1000),
  adminNotes: z.string().trim().min(2).max(2000).optional(),
});
