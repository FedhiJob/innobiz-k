import type { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { listNotificationsQuerySchema, markReadSchema } from "./notification.schemas";

const parseLimit = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 20;
  }
  return Math.min(parsed, 50);
};

export const listNotifications = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const query = listNotificationsQuerySchema.parse(req.query);
  const unreadOnly = query.unreadOnly === "true";
  const take = parseLimit(query.limit);

  const [items, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: {
        userId: req.user.id,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    }),
    prisma.notification.count({
      where: {
        userId: req.user.id,
        readAt: null,
      },
    }),
  ]);

  return sendSuccess(res, { items, unreadCount }, "Notifications fetched");
};

export const markNotificationsRead = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = markReadSchema.parse(req.body);

  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      id: {
        in: payload.ids,
      },
    },
    data: {
      readAt: new Date(),
    },
  });

  return sendSuccess(res, null, "Notifications marked as read");
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return sendSuccess(res, null, "All notifications marked as read");
};
