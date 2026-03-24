import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  limit: z.string().optional(),
  unreadOnly: z.string().optional(),
});

export const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
