import type { Request, Response } from "express";
import { NotificationType, Role } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { notifyAdmins } from "../../services/notification.service";
import { documentUploadConfig } from "./document.upload";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const sanitizeFileName = (originalName: string) => {
  const base = path.basename(originalName);
  const ext = path.extname(base).toLowerCase();
  const nameOnly = path
    .basename(base, ext)
    .replace(/[^A-Za-z0-9 _.-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const safeBase = nameOnly.length > 0 ? nameOnly : "document";
  const trimmed = safeBase.slice(0, 80);
  return `${trimmed}${ext}`;
};

const resolveFilePath = (fileUrl: string) => {
  const normalized = fileUrl.replace(/\//g, path.sep);
  const resolved = path.resolve(process.cwd(), normalized);

  if (!resolved.startsWith(uploadsDir)) {
    throw new ApiError(400, "Invalid file path");
  }

  return resolved;
};

const safeUnlink = async (filePath?: string) => {
  if (!filePath) {
    return;
  }
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
};

const getDocumentWithAccess = async (
  applicationId: string,
  documentId: string,
  user: { id: string; role: Role },
) => {
  if (user.role === Role.ADMIN) {
    return prisma.document.findFirst({
      where: {
        id: documentId,
        applicationId,
      },
    });
  }

  return prisma.document.findFirst({
    where: {
      id: documentId,
      applicationId,
      application: {
        startupId: user.id,
      },
    },
  });
};

export const uploadDocument = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      startupId: req.user.id,
    },
    select: {
      id: true,
      status: true,
      companyName: true,
      _count: {
        select: {
          documents: true,
        },
      },
    },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status !== "DRAFT") {
    throw new ApiError(400, "Documents can only be uploaded while application is in draft");
  }

  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  if (application._count.documents >= 1) {
    throw new ApiError(400, "Only one pitch deck document is allowed. Delete the existing document to upload another.");
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!documentUploadConfig.allowedExtensions.has(ext) || !documentUploadConfig.allowedMimeTypes.has(req.file.mimetype)) {
    await safeUnlink(req.file.path);
    throw new ApiError(400, "Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX.");
  }

  if (req.file.size > documentUploadConfig.maxFileSize) {
    await safeUnlink(req.file.path);
    throw new ApiError(400, "File too large. Max size is 10MB.");
  }

  const safeFileName = sanitizeFileName(req.file.originalname);
  const fileUrl = path.posix.join("uploads", req.file.filename);

  const document = await prisma.document.create({
    data: {
      applicationId,
      fileName: safeFileName,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    },
  });

  await notifyAdmins({
    type: NotificationType.DOCUMENT_UPLOADED,
    title: "Pitch deck uploaded",
    message: `${req.user.name} uploaded a pitch deck for ${application.companyName ?? "their application"}.`,
    link: `/admin/applications/${applicationId}`,
  });

  return sendSuccess(res, document, "Document uploaded", 201);
};

export const downloadDocument = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);
  const documentId = String(req.params.docId);

  const document = await getDocumentWithAccess(applicationId, documentId, req.user);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const filePath = resolveFilePath(document.fileUrl);

  return res.download(filePath, document.fileName);
};

export const deleteDocument = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);
  const documentId = String(req.params.docId);

  const document = await getDocumentWithAccess(applicationId, documentId, req.user);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const filePath = resolveFilePath(document.fileUrl);

  await prisma.document.delete({
    where: {
      id: document.id,
    },
  });

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return sendSuccess(res, null, "Document deleted");
};
