import type { Request, Response } from "express";
import { ApplicationStatus, EmailTemplateType, Prisma } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { parsePagination } from "../../utils/pagination";
import { sendAndLogEmail } from "../../services/email.service";
import { assertStatusTransition } from "../../utils/status-transition";
import {
  createApplicationSchema,
  listApplicationQuerySchema,
  updateApplicationSchema,
} from "./application.schemas";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const toDecimalOrUndefined = (value?: number) => {
  if (value === undefined) {
    return undefined;
  }

  return new Prisma.Decimal(value);
};

const resolveUploadPath = (fileUrl: string) => {
  const normalized = fileUrl.replace(/\//g, path.sep);
  const resolved = path.resolve(process.cwd(), normalized);

  if (!resolved.startsWith(uploadsDir)) {
    throw new ApiError(400, "Invalid file path");
  }

  return resolved;
};

const mapFounderInput = (
  founders?: Array<{
    name: string;
    email: string;
    phone?: string;
    role: string;
    isPrimary?: boolean;
  }>,
) => {
  if (!founders) {
    return undefined;
  }

  return founders.map((founder, index) => ({
    name: founder.name,
    email: founder.email,
    phone: founder.phone ?? null,
    role: founder.role,
    isPrimary: founder.isPrimary ?? index === 0,
  }));
};

const ensureDraftSubmittable = (application: {
  companyName: string | null;
  sector: string | null;
  stage: string | null;
  description: string | null;
  teamSize: number | null;
  fundingNeeded: Prisma.Decimal | null;
  founders: Array<{ isPrimary: boolean }>;
  documents?: Array<unknown>;
}) => {
  if (application.description && application.description.trim().length < 20) {
    throw new ApiError(400, "Application description must be at least 20 characters.");
  }

  if (
    !application.companyName ||
    !application.sector ||
    !application.stage ||
    !application.description ||
    !application.teamSize ||
    !application.fundingNeeded
  ) {
    throw new ApiError(400, "Application is incomplete. Fill all required fields before submitting.");
  }

  if (application.teamSize <= 0) {
    throw new ApiError(400, "Team size must be greater than 0.");
  }

  if (application.fundingNeeded.lte(0)) {
    throw new ApiError(400, "Funding needed must be greater than 0.");
  }

  if (application.founders.length < 1 || application.founders.length > 3) {
    throw new ApiError(400, "Application must include between 1 and 3 founders.");
  }

  const primaryFounders = application.founders.filter((founder) => founder.isPrimary);
  if (primaryFounders.length !== 1) {
    throw new ApiError(400, "Application must include exactly one primary founder.");
  }

  if (application.documents && application.documents.length !== 1) {
    throw new ApiError(400, "Application must include exactly one pitch deck document before submission.");
  }
};

export const createApplication = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = createApplicationSchema.parse(req.body);
  const founders = mapFounderInput(payload.founders);
  if (payload.status === ApplicationStatus.SUBMITTED) {
    throw new ApiError(400, "Submit the application after uploading documents using /submit.");
  }
  const status = ApplicationStatus.DRAFT;

  const created = await prisma.application.create({
    data: {
      startupId: req.user.id,
      companyName: payload.companyName ?? null,
      sector: payload.sector ?? null,
      stage: payload.stage ?? null,
      description: payload.description ?? null,
      teamSize: payload.teamSize ?? null,
      fundingNeeded: toDecimalOrUndefined(payload.fundingNeeded),
      status,
      submittedAt: null,
      founders: founders ? { create: founders } : undefined,
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: status,
          changedById: req.user.id,
          note: "Draft created",
        },
      },
    },
    include: {
      founders: true,
      documents: true,
      startup: {
        select: {
          email: true,
        },
      },
      statusHistory: {
        orderBy: {
          changedAt: "asc",
        },
      },
    },
  });

  return sendSuccess(res, created, "Application created", 201);
};

export const updateApplication = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = updateApplicationSchema.parse(req.body);
  const applicationId = String(req.params.id);

  const updateData: Prisma.ApplicationUpdateInput = {};

  if (payload.companyName !== undefined) {
    updateData.companyName = payload.companyName;
  }
  if (payload.sector !== undefined) {
    updateData.sector = payload.sector;
  }
  if (payload.stage !== undefined) {
    updateData.stage = payload.stage;
  }
  if (payload.description !== undefined) {
    updateData.description = payload.description;
  }
  if (payload.teamSize !== undefined) {
    updateData.teamSize = payload.teamSize;
  }
  if (payload.fundingNeeded !== undefined) {
    updateData.fundingNeeded = toDecimalOrUndefined(payload.fundingNeeded);
  }

  const existing = await prisma.application.findFirst({
    where: {
      id: applicationId,
      startupId: req.user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  if (existing.status !== ApplicationStatus.DRAFT) {
    throw new ApiError(400, "Only draft applications can be updated");
  }

  const founders = mapFounderInput(payload.founders);

  const updated = await prisma.$transaction(async (tx) => {
    if (founders) {
      await tx.founder.deleteMany({
        where: {
          applicationId,
        },
      });

      if (founders.length > 0) {
        await tx.founder.createMany({
          data: founders.map((founder) => ({
            applicationId,
            name: founder.name,
            email: founder.email,
            phone: founder.phone,
            role: founder.role,
            isPrimary: founder.isPrimary,
          })),
        });
      }
    }

    return tx.application.update({
      where: {
        id: applicationId,
      },
      data: updateData,
      include: {
        founders: true,
        documents: true,
        statusHistory: {
          orderBy: {
            changedAt: "asc",
          },
        },
      },
    });
  });

  return sendSuccess(res, updated, "Draft application updated");
};

export const deleteApplicationDraft = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);

  const existing = await prisma.application.findFirst({
    where: {
      id: applicationId,
      startupId: req.user.id,
    },
    select: {
      id: true,
      status: true,
      documents: {
        select: {
          fileUrl: true,
        },
      },
    },
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  if (existing.status !== ApplicationStatus.DRAFT) {
    throw new ApiError(400, "Only draft applications can be deleted");
  }

  await prisma.application.delete({
    where: {
      id: applicationId,
    },
  });

  for (const document of existing.documents) {
    const filePath = resolveUploadPath(document.fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  return sendSuccess(res, null, "Draft application deleted");
};

export const listApplications = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const query = listApplicationQuerySchema.parse(req.query);
  const pagination = parsePagination(query);

  const where: Prisma.ApplicationWhereInput = {
    startupId: req.user.id,
  };

  if (query.status) {
    where.status = query.status;
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
        updatedAt: true,
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
    "Applications fetched",
  );
};

export const getApplicationById = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      startupId: req.user.id,
    },
    include: {
      founders: true,
      documents: true,
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

  return sendSuccess(res, application, "Application fetched");
};

export const submitApplication = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);

  const existing = await prisma.application.findFirst({
    where: {
      id: applicationId,
      startupId: req.user.id,
    },
    select: {
      id: true,
      status: true,
      companyName: true,
      sector: true,
      stage: true,
      description: true,
      teamSize: true,
      fundingNeeded: true,
      founders: {
        select: {
          isPrimary: true,
        },
      },
      documents: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  assertStatusTransition(
    existing.status,
    ApplicationStatus.SUBMITTED,
    "Only draft applications can be submitted",
  );

  ensureDraftSubmittable(existing);

  const submitted = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: ApplicationStatus.SUBMITTED,
      submittedAt: new Date(),
      statusHistory: {
        create: {
          fromStatus: ApplicationStatus.DRAFT,
          toStatus: ApplicationStatus.SUBMITTED,
          changedById: req.user.id,
          note: "Application submitted by startup",
        },
      },
    },
    include: {
      founders: true,
      documents: true,
      startup: {
        select: {
          email: true,
        },
      },
      statusHistory: {
        orderBy: {
          changedAt: "asc",
        },
      },
    },
  });

  // Email trigger is intentionally deferred until the email service module is implemented.
  await sendAndLogEmail({
    applicationId: submitted.id,
    companyName: submitted.companyName,
    submittedDate: submitted.submittedAt,
    recipient: submitted.startup.email,
    templateType: EmailTemplateType.APPLICATION_RECEIVED,
  });

  return sendSuccess(res, submitted, "Application submitted");
};
