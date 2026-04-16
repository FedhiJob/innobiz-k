import { z } from "zod";

export const createOfficeSpaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().min(10).max(220),
  fullDescription: z.string().trim().min(20).max(4000),
  locationLabel: z.string().trim().max(80).optional(),
  capacity: z.number().int().min(1).max(5000).optional(),
  amenities: z.array(z.string().trim().min(2).max(80)).max(20).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const updateOfficeSpaceSchema = createOfficeSpaceSchema.partial();
