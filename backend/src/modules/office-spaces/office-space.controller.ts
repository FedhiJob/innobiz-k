import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { getPublicBaseUrl } from "../../utils/public-url";
import { createOfficeSpaceSchema, updateOfficeSpaceSchema } from "./office-space.schemas";

const officeSpaceUploadsDir = path.resolve(process.cwd(), "uploads", "office-spaces");

type OfficeSpaceRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  locationLabel: string | null;
  capacity: number | null;
  amenities: string[];
  imageFileName: string | null;
  imageFileSize: number | null;
  imageMimeType: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const buildImageUrl = (req: Request, fileName: string | null) => {
  if (!fileName) {
    return null;
  }

  return `${getPublicBaseUrl(req)}/uploads/office-spaces/${fileName}`;
};

const serializeOfficeSpace = (req: Request, officeSpace: OfficeSpaceRecord) => ({
  ...officeSpace,
  imageUrl: buildImageUrl(req, officeSpace.imageFileName),
});

const normalizeAmenities = (value: unknown): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // fall through to plain-text parsing
    }
  }

  return trimmed
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeBody = (body: Record<string, unknown>) => ({
  ...body,
  locationLabel:
    typeof body.locationLabel === "string" && body.locationLabel.trim() === ""
      ? undefined
      : body.locationLabel,
  published: typeof body.published === "string" ? body.published === "true" : body.published,
  capacity:
    typeof body.capacity === "string" && body.capacity.trim() !== ""
      ? Number(body.capacity)
      : body.capacity,
  sortOrder:
    typeof body.sortOrder === "string" && body.sortOrder.trim() !== ""
      ? Number(body.sortOrder)
      : body.sortOrder,
  amenities: normalizeAmenities(body.amenities),
});

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "space";

const createUniqueSlug = async (name: string, excludeId?: string) => {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.officeSpace.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

const deleteStoredImage = async (fileName: string | null) => {
  if (!fileName) {
    return;
  }

  const filePath = path.resolve(officeSpaceUploadsDir, fileName);
  if (!filePath.startsWith(officeSpaceUploadsDir)) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Ignore cleanup failures for missing files.
  }
};

export const listOfficeSpacesPublic = async (req: Request, res: Response) => {
  const spaces = await prisma.officeSpace.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return sendSuccess(res, spaces.map((space) => serializeOfficeSpace(req, space)), "Office spaces fetched");
};

export const getOfficeSpacePublic = async (req: Request, res: Response) => {
  const slug = String(req.params.slug);

  const officeSpace = await prisma.officeSpace.findFirst({
    where: {
      slug,
      published: true,
    },
  });

  if (!officeSpace) {
    throw new ApiError(404, "Office space not found");
  }

  return sendSuccess(res, serializeOfficeSpace(req, officeSpace), "Office space fetched");
};

export const listOfficeSpacesAdmin = async (req: Request, res: Response) => {
  const spaces = await prisma.officeSpace.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return sendSuccess(res, spaces.map((space) => serializeOfficeSpace(req, space)), "Office spaces fetched");
};

export const createOfficeSpace = async (req: Request, res: Response) => {
  const payload = createOfficeSpaceSchema.parse(normalizeBody(req.body as Record<string, unknown>));
  const slug = await createUniqueSlug(payload.name);
  const file = req.file;

  const created = await prisma.officeSpace.create({
    data: {
      name: payload.name,
      slug,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription,
      locationLabel: payload.locationLabel ?? null,
      capacity: payload.capacity ?? null,
      amenities: payload.amenities ?? [],
      published: payload.published ?? true,
      sortOrder: payload.sortOrder ?? 0,
      imageFileName: file?.filename ?? null,
      imageFileSize: file?.size ?? null,
      imageMimeType: file?.mimetype ?? null,
    },
  });

  return sendSuccess(res, serializeOfficeSpace(req, created), "Office space created", 201);
};

export const updateOfficeSpace = async (req: Request, res: Response) => {
  const officeSpaceId = String(req.params.id);
  const payload = updateOfficeSpaceSchema.parse(normalizeBody(req.body as Record<string, unknown>));
  const file = req.file;

  if (Object.keys(payload).length === 0 && !file) {
    throw new ApiError(400, "At least one field is required");
  }

  const existing = await prisma.officeSpace.findUnique({
    where: { id: officeSpaceId },
  });

  if (!existing) {
    throw new ApiError(404, "Office space not found");
  }

  const nextSlug = payload.name ? await createUniqueSlug(payload.name, officeSpaceId) : undefined;

  const updated = await prisma.officeSpace.update({
    where: { id: officeSpaceId },
    data: {
      name: payload.name,
      slug: nextSlug,
      shortDescription: payload.shortDescription,
      fullDescription: payload.fullDescription,
      locationLabel: payload.locationLabel ?? undefined,
      capacity: payload.capacity ?? undefined,
      amenities: payload.amenities ?? undefined,
      published: payload.published,
      sortOrder: payload.sortOrder,
      imageFileName: file?.filename ?? undefined,
      imageFileSize: file?.size ?? undefined,
      imageMimeType: file?.mimetype ?? undefined,
    },
  });

  if (file && existing.imageFileName && existing.imageFileName !== file.filename) {
    await deleteStoredImage(existing.imageFileName);
  }

  return sendSuccess(res, serializeOfficeSpace(req, updated), "Office space updated");
};

export const deleteOfficeSpace = async (req: Request, res: Response) => {
  const officeSpaceId = String(req.params.id);

  const existing = await prisma.officeSpace.findUnique({
    where: { id: officeSpaceId },
  });

  if (!existing) {
    throw new ApiError(404, "Office space not found");
  }

  await prisma.officeSpace.delete({
    where: { id: officeSpaceId },
  });

  await deleteStoredImage(existing.imageFileName);

  return sendSuccess(res, null, "Office space deleted");
};
