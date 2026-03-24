import { SpaceRequestStatus } from "@prisma/client";
import { z } from "zod";

export const createSpaceRequestSchema = z.object({
  startupName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  teamSize: z.number().int().min(1).max(500).optional(),
  resourceTypes: z.array(z.string().trim().min(2)).min(1),
  startDate: z.string().trim().min(4),
  endDate: z.string().trim().min(4),
  purpose: z.string().trim().min(10).max(2000),
  additionalNotes: z.string().trim().max(2000).optional(),
});

export const spaceRequestListQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  status: z
    .enum([SpaceRequestStatus.PENDING, SpaceRequestStatus.APPROVED, SpaceRequestStatus.REJECTED])
    .optional(),
  search: z.string().trim().min(2).optional(),
});

export const approveSpaceRequestSchema = z.object({
  adminNotes: z.string().trim().min(2).max(2000).optional(),
});

export const rejectSpaceRequestSchema = z.object({
  rejectionReason: z.string().trim().min(3).max(1000),
  adminNotes: z.string().trim().min(2).max(2000).optional(),
});
