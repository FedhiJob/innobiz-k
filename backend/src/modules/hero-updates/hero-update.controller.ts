import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { HeroMediaType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { getPublicBaseUrl } from "../../utils/public-url";
import {
  createHeroUpdateSchema,
  heroUpdateQuerySchema,
  updateHeroUpdateSchema,
} from "./hero-update.schemas";

const heroUploadsDir = path.resolve(process.cwd(), "uploads", "hero-updates");

const normalizeCtaUrl = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return null;
};

const buildMediaUrl = (req: Request, fileName: string | null) => {
  if (!fileName) {
    return null;
  }
  return `${getPublicBaseUrl(req)}/uploads/hero-updates/${fileName}`;
};

const serializeHeroUpdate = (req: Request, update: {
  id: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  mediaFileName: string | null;
  mediaType: HeroMediaType | null;
  mediaMimeType: string | null;
  mediaFileSize: number | null;
}) => ({
  ...update,
  mediaUrl: buildMediaUrl(req, update.mediaFileName),
});

const parseLimit = (value?: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 6;
  }
  return Math.min(parsed, 12);
};

export const listHeroUpdatesPublic = async (req: Request, res: Response) => {
  const query = heroUpdateQuerySchema.parse(req.query);
  const take = parseLimit(query.limit);

  const updates = await prisma.heroUpdate.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });

  return sendSuccess(res, updates.map((update) => serializeHeroUpdate(req, update)), "Hero updates fetched");
};

export const listHeroUpdatesAdmin = async (req: Request, res: Response) => {
  const updates = await prisma.heroUpdate.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return sendSuccess(res, updates.map((update) => serializeHeroUpdate(req, update)), "Hero updates fetched");
};

export const createHeroUpdate = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const normalizedPayload = {
    ...req.body,
    ctaLabel:
      typeof req.body.ctaLabel === "string" && req.body.ctaLabel.trim() === ""
        ? undefined
        : req.body.ctaLabel,
    ctaUrl:
      typeof req.body.ctaUrl === "string" && req.body.ctaUrl.trim() === ""
        ? undefined
        : req.body.ctaUrl,
    published:
      typeof req.body.published === "string" ? req.body.published === "true" : req.body.published,
  };

  const payload = createHeroUpdateSchema.parse(normalizedPayload);

  const file = req.file;
  const mediaType = file?.mimetype.startsWith("video/")
    ? HeroMediaType.VIDEO
    : file
      ? HeroMediaType.IMAGE
      : null;

  const created = await prisma.heroUpdate.create({
    data: {
      title: payload.title,
      message: payload.message,
      ctaLabel: payload.ctaLabel ?? null,
      ctaUrl: normalizeCtaUrl(payload.ctaUrl),
      published: payload.published ?? true,
      createdById: req.user.id,
      mediaType,
      mediaFileName: file?.filename ?? null,
      mediaFileSize: file?.size ?? null,
      mediaMimeType: file?.mimetype ?? null,
    },
  });

  return sendSuccess(res, serializeHeroUpdate(req, created), "Hero update created", 201);
};

export const updateHeroUpdate = async (req: Request, res: Response) => {
  const updateId = String(req.params.id);
  const normalizedPayload = {
    ...req.body,
    ctaLabel:
      typeof req.body.ctaLabel === "string" && req.body.ctaLabel.trim() === ""
        ? undefined
        : req.body.ctaLabel,
    ctaUrl:
      typeof req.body.ctaUrl === "string" && req.body.ctaUrl.trim() === ""
        ? undefined
        : req.body.ctaUrl,
    published:
      typeof req.body.published === "string" ? req.body.published === "true" : req.body.published,
  };
  const payload = updateHeroUpdateSchema.parse(normalizedPayload);

  const existing = await prisma.heroUpdate.findUnique({
    where: { id: updateId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Hero update not found");
  }

  const file = req.file;
  const mediaType = file?.mimetype.startsWith("video/")
    ? HeroMediaType.VIDEO
    : file
      ? HeroMediaType.IMAGE
      : undefined;

  const updated = await prisma.heroUpdate.update({
    where: { id: updateId },
    data: {
      title: payload.title,
      message: payload.message,
      ctaLabel: payload.ctaLabel,
      ctaUrl: payload.ctaUrl !== undefined ? normalizeCtaUrl(payload.ctaUrl) : undefined,
      published: payload.published,
      mediaType: mediaType ?? undefined,
      mediaFileName: file?.filename ?? undefined,
      mediaFileSize: file?.size ?? undefined,
      mediaMimeType: file?.mimetype ?? undefined,
    },
  });

  return sendSuccess(res, serializeHeroUpdate(req, updated), "Hero update updated");
};

export const deleteHeroUpdate = async (req: Request, res: Response) => {
  const updateId = String(req.params.id);

  const existing = await prisma.heroUpdate.findUnique({
    where: { id: updateId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, "Hero update not found");
  }

  await prisma.heroUpdate.delete({
    where: { id: updateId },
  });

  return sendSuccess(res, null, "Hero update deleted");
};

export const downloadHeroMedia = async (req: Request, res: Response) => {
  const fileName = String(req.params.file);
  const filePath = path.resolve(heroUploadsDir, fileName);

  if (!filePath.startsWith(heroUploadsDir)) {
    throw new ApiError(400, "Invalid media path");
  }

  try {
    await fs.promises.access(filePath);
  } catch {
    throw new ApiError(404, "Media not found");
  }

  return res.sendFile(filePath);
};
