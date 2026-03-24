import { z } from "zod";

export const heroUpdateQuerySchema = z.object({
  limit: z.string().optional(),
});

export const createHeroUpdateSchema = z.object({
  title: z.string().trim().min(3).max(140),
  message: z.string().trim().min(5).max(1000),
  ctaLabel: z.string().trim().min(2).max(80).optional(),
  ctaUrl: z.string().trim().min(2).max(200).optional(),
  published: z.boolean().optional(),
});

export const updateHeroUpdateSchema = createHeroUpdateSchema
  .partial()
  .refine(
    (value) =>
      value.title !== undefined ||
      value.message !== undefined ||
      value.ctaLabel !== undefined ||
      value.ctaUrl !== undefined ||
      value.published !== undefined,
    {
      message: "At least one field is required",
    },
  );
