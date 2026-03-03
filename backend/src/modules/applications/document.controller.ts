import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const resolveFilePath = (fileUrl: string) => {
  const normalized = fileUrl.replace(/\//g, path.sep);
  const resolved = path.resolve(process.cwd(), normalized);

  if (!resolved.startsWith(uploadsDir)) {
    throw new ApiError(400, "Invalid file path");
  }

  return resolved;
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

  const fileUrl = path.posix.join("uploads", req.file.filename);

  const document = await prisma.document.create({
    data: {
      applicationId,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    },
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
