import { NotificationType, Role } from "@prisma/client";
import { prisma } from "../config/prisma";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
};

export const createNotification = async (input: CreateNotificationInput) => {
  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      notifyInApp: true,
    },
  });

  if (!user?.notifyInApp) {
    return null;
  }

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
  });
};

export const notifyAdmins = async (input: Omit<CreateNotificationInput, "userId">) => {
  const admins = await prisma.user.findMany({
    where: {
      role: Role.ADMIN,
      notifyInApp: true,
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    return { count: 0 };
  }

  return prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    })),
  });
};
