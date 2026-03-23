import type { Request, Response } from "express";
import { ApplicationStatus, EmailTemplateType, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { parsePagination } from "../../utils/pagination";
import { sendAndLogEmail } from "../../services/email.service";
import { createNotification } from "../../services/notification.service";
import { assertStatusTransition } from "../../utils/status-transition";
import { adminListQuerySchema, approveSchema, rejectSchema } from "./admin.schemas";

export const getAdminStats = async (_req: Request, res: Response) => {
  const [total, draft, submitted, approved, rejected] = await prisma.$transaction([
    prisma.application.count(),
    prisma.application.count({ where: { status: ApplicationStatus.DRAFT } }),
    prisma.application.count({ where: { status: ApplicationStatus.SUBMITTED } }),
    prisma.application.count({ where: { status: ApplicationStatus.APPROVED } }),
    prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),
  ]);

  return sendSuccess(
    res,
    {
      total,
      draft,
      submitted,
      approved,
      rejected,
    },
    "Admin stats fetched",
  );
};

export const listApplicationsAdmin = async (req: Request, res: Response) => {
  const query = adminListQuerySchema.parse(req.query);
  const pagination = parsePagination(query);

  const where: Prisma.ApplicationWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    const search = query.search;
    where.OR = [
      {
        companyName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        startup: {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        founders: {
          some: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  const [total, applications] = await prisma.$transaction([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        companyName: true,
        status: true,
        submittedAt: true,
        createdAt: true,
        startup: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return sendSuccess(
    res,
    {
      items: applications,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize) || 1,
      },
    },
    "Admin applications fetched",
  );
};

export const getApplicationAdmin = async (req: Request, res: Response) => {
  const applicationId = String(req.params.id);

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      startup: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      founders: true,
      documents: true,
      emailLogs: true,
      monthlyReports: {
        orderBy: {
          reportMonth: "desc",
        },
      },
      statusHistory: {
        orderBy: {
          changedAt: "asc",
        },
      },
    },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  return sendSuccess(res, application, "Admin application fetched");
};

export const approveApplication = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = approveSchema.parse(req.body);
  const applicationId = String(req.params.id);

  const existing = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  assertStatusTransition(
    existing.status,
    ApplicationStatus.APPROVED,
    "Only submitted applications can be approved",
  );

  const updated = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: ApplicationStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedById: req.user.id,
      adminNotes: payload.adminNotes ?? null,
      statusHistory: {
        create: {
          fromStatus: ApplicationStatus.SUBMITTED,
          toStatus: ApplicationStatus.APPROVED,
          changedById: req.user.id,
          note: payload.adminNotes ?? "Approved by admin",
        },
      },
    },
    include: {
      startup: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      founders: true,
      documents: true,
      statusHistory: {
        orderBy: {
          changedAt: "asc",
        },
      },
    },
  });

  await sendAndLogEmail({
    applicationId: updated.id,
    companyName: updated.companyName,
    decisionDate: updated.reviewedAt,
    recipient: updated.startup.email,
    templateType: EmailTemplateType.APPLICATION_APPROVED,
  });

  await createNotification({
    userId: updated.startup.id,
    type: NotificationType.APPLICATION_APPROVED,
    title: "Application approved",
    message: "Congratulations! Your application has been approved by the admin team.",
    link: `/application/${updated.id}`,
  });

  return sendSuccess(res, updated, "Application approved");
};

export const rejectApplication = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = rejectSchema.parse(req.body);
  const applicationId = String(req.params.id);

  const existing = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  assertStatusTransition(
    existing.status,
    ApplicationStatus.REJECTED,
    "Only submitted applications can be rejected",
  );

  const updated = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: ApplicationStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedById: req.user.id,
      rejectionReason: payload.rejectionReason,
      adminNotes: payload.adminNotes ?? null,
      statusHistory: {
        create: {
          fromStatus: ApplicationStatus.SUBMITTED,
          toStatus: ApplicationStatus.REJECTED,
          changedById: req.user.id,
          note: payload.rejectionReason,
        },
      },
    },
    include: {
      startup: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      founders: true,
      documents: true,
      statusHistory: {
        orderBy: {
          changedAt: "asc",
        },
      },
    },
  });

  await sendAndLogEmail({
    applicationId: updated.id,
    companyName: updated.companyName,
    decisionDate: updated.reviewedAt,
    recipient: updated.startup.email,
    templateType: EmailTemplateType.APPLICATION_REJECTED,
  });

  await createNotification({
    userId: updated.startup.id,
    type: NotificationType.APPLICATION_REJECTED,
    title: "Application rejected",
    message: "Your application was not approved. Check the admin notes for more details.",
    link: `/application/${updated.id}`,
  });

  return sendSuccess(res, updated, "Application rejected");
};
