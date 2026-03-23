import type { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { ApplicationStatus, NotificationType, Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { notifyAdmins } from "../../services/notification.service";
import { documentUploadConfig } from "./document.upload";
import { createMonthlyReportSchema } from "./monthly-report.schemas";

const uploadsDir = path.resolve(process.cwd(), "uploads");

const sanitizeFileName = (originalName: string) => {
  const base = path.basename(originalName);
  const ext = path.extname(base).toLowerCase();
  const nameOnly = path
    .basename(base, ext)
    .replace(/[^A-Za-z0-9 _.-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const safeBase = nameOnly.length > 0 ? nameOnly : "monthly-report";
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

const parseReportMonth = (value?: string) => {
  if (!value) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const trimmed = value.trim();
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]) - 1;
    return new Date(year, month, 1);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "Invalid reportMonth value");
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
};

const getMonthlyReportWithAccess = async (
  applicationId: string,
  reportId: string,
  user: { id: string; role: Role },
) => {
  if (user.role === Role.ADMIN) {
    return prisma.monthlyReport.findFirst({
      where: {
        id: reportId,
        applicationId,
      },
    });
  }

  return prisma.monthlyReport.findFirst({
    where: {
      id: reportId,
      applicationId,
      startupId: user.id,
    },
  });
};

export const uploadMonthlyReport = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);
  const payload = createMonthlyReportSchema.parse(req.body ?? {});

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      startupId: req.user.id,
    },
    select: {
      id: true,
      status: true,
      companyName: true,
    },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status === ApplicationStatus.DRAFT || application.status === ApplicationStatus.REJECTED) {
    throw new ApiError(400, "Monthly reports can only be submitted after the application is submitted or approved.");
  }

  if (!req.file) {
    throw new ApiError(400, "Report document is required");
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

  const reportMonth = parseReportMonth(payload.reportMonth);

  const existing = await prisma.monthlyReport.findFirst({
    where: {
      applicationId,
      reportMonth,
    },
  });

  if (existing) {
    await safeUnlink(req.file.path);
    throw new ApiError(400, "Monthly report already submitted for this month.");
  }

  const safeFileName = sanitizeFileName(req.file.originalname);
  const fileUrl = path.posix.join("uploads", "monthly-reports", req.file.filename);

  const report = await prisma.monthlyReport.create({
    data: {
      applicationId,
      startupId: req.user.id,
      headline: payload.headline.trim(),
      description: payload.description.trim(),
      reportMonth,
      fileName: safeFileName,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    },
  });

  await notifyAdmins({
    type: NotificationType.MONTHLY_REPORT_SUBMITTED,
    title: "Monthly report submitted",
    message: `${req.user.name} submitted a monthly report for ${application.companyName ?? "their startup"}.`,
    link: `/admin/applications/${applicationId}`,
  });

  return sendSuccess(res, report, "Monthly report uploaded", 201);
};

export const downloadMonthlyReport = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const applicationId = String(req.params.id);
  const reportId = String(req.params.reportId);

  const report = await getMonthlyReportWithAccess(applicationId, reportId, req.user);

  if (!report) {
    throw new ApiError(404, "Monthly report not found");
  }

  const filePath = resolveFilePath(report.fileUrl);
  return res.download(filePath, report.fileName);
};
