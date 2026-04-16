import type { Request, Response } from "express";
import { NotificationType, Prisma, SpaceRequestStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { parsePagination } from "../../utils/pagination";
import { notifyAdmins } from "../../services/notification.service";
import {
  approveSpaceRequestSchema,
  createSpaceRequestSchema,
  rejectSpaceRequestSchema,
  spaceRequestListQuerySchema,
} from "./space-request.schemas";

const parseDate = (value: string, label: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `Invalid ${label} date`);
  }
  return parsed;
};

export const createSpaceRequest = async (req: Request, res: Response) => {
  const payload = createSpaceRequestSchema.parse(req.body);
  const startDate = parseDate(payload.startDate, "start");
  const endDate = parseDate(payload.endDate, "end");

  if (endDate < startDate) {
    throw new ApiError(400, "End date must be after the start date.");
  }

  const requestedSpace = payload.officeSpaceId
    ? await prisma.officeSpace.findUnique({
        where: { id: payload.officeSpaceId },
        select: { id: true, name: true, published: true },
      })
    : null;

  if (payload.officeSpaceId && (!requestedSpace || !requestedSpace.published)) {
    throw new ApiError(400, "Selected office space is no longer available.");
  }

  const created = await prisma.spaceRequest.create({
    data: {
      startupName: payload.startupName,
      contactName: payload.contactName,
      email: payload.email,
      phone: payload.phone,
      officeSpaceId: requestedSpace?.id ?? null,
      officeSpaceName: requestedSpace?.name ?? null,
      teamSize: payload.teamSize ?? null,
      resourceTypes: payload.resourceTypes,
      startDate,
      endDate,
      purpose: payload.purpose,
      additionalNotes: payload.additionalNotes ?? null,
    },
  });

  await notifyAdmins({
    type: NotificationType.SPACE_REQUEST_SUBMITTED,
    title: "New space request",
    message: `${created.startupName} submitted a space request for review.`,
    link: "/admin/space-requests",
  });

  return sendSuccess(res, created, "Space request submitted", 201);
};

export const listSpaceRequestsAdmin = async (req: Request, res: Response) => {
  const query = spaceRequestListQuerySchema.parse(req.query);
  const pagination = parsePagination(query);

  const where: Prisma.SpaceRequestWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    const search = query.search;
    where.OR = [
      { startupName: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.spaceRequest.count({ where }),
    prisma.spaceRequest.findMany({
      where,
      include: {
        officeSpace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.skip,
      take: pagination.take,
    }),
  ]);

  return sendSuccess(
    res,
    {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize) || 1,
      },
    },
    "Space requests fetched",
  );
};

export const getSpaceRequestAdmin = async (req: Request, res: Response) => {
  const requestId = String(req.params.id);

  const spaceRequest = await prisma.spaceRequest.findUnique({
    where: { id: requestId },
    include: {
      officeSpace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!spaceRequest) {
    throw new ApiError(404, "Space request not found");
  }

  return sendSuccess(res, spaceRequest, "Space request fetched");
};

export const approveSpaceRequest = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const requestId = String(req.params.id);
  const payload = approveSpaceRequestSchema.parse(req.body);

  const existing = await prisma.spaceRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true },
  });

  if (!existing) {
    throw new ApiError(404, "Space request not found");
  }

  if (existing.status !== SpaceRequestStatus.PENDING) {
    throw new ApiError(400, "Only pending requests can be approved.");
  }

  const updated = await prisma.spaceRequest.update({
    where: { id: requestId },
    data: {
      status: SpaceRequestStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedById: req.user.id,
      adminNotes: payload.adminNotes ?? null,
    },
  });

  return sendSuccess(res, updated, "Space request approved");
};

export const rejectSpaceRequest = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const requestId = String(req.params.id);
  const payload = rejectSpaceRequestSchema.parse(req.body);

  const existing = await prisma.spaceRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true },
  });

  if (!existing) {
    throw new ApiError(404, "Space request not found");
  }

  if (existing.status !== SpaceRequestStatus.PENDING) {
    throw new ApiError(400, "Only pending requests can be rejected.");
  }

  const updated = await prisma.spaceRequest.update({
    where: { id: requestId },
    data: {
      status: SpaceRequestStatus.REJECTED,
      reviewedAt: new Date(),
      reviewedById: req.user.id,
      rejectionReason: payload.rejectionReason,
      adminNotes: payload.adminNotes ?? null,
    },
  });

  return sendSuccess(res, updated, "Space request rejected");
};
