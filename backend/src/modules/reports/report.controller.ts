import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { sendAndLogEmail } from "../../services/email.service";
import {
  buildMonthlyReportData,
  renderCsvReport,
  renderTextReport,
  resolveMonthlyRange,
  writeDocxReport,
  writePdfReport,
} from "../../services/report.service";
import { EmailTemplateType } from "@prisma/client";
import { monthlyReportEmailSchema, monthlyReportShareSchema } from "./report.schemas";

const SUPPORTED_FORMATS = new Set(["pdf", "docx", "txt", "csv"]);

const createShareToken = () => crypto.randomBytes(24).toString("base64url");

const ensureReportDirectory = async (token: string) => {
  const dir = path.join(process.cwd(), "uploads", "reports", token);
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
};

const buildFileName = (format: string, rangeLabel: string) => {
  const safeRange = rangeLabel.replace(/[^0-9\- ]/g, "").replace(/\s+/g, "_");
  return `innobizk-monthly-report-${safeRange}.${format}`;
};

const getShareUrl = (req: Request, token: string) => {
  return `${req.protocol}://${req.get("host")}/api/reports/share/${token}`;
};

const generateReportFile = async (token: string, format: string, rangeLabel: string) => {
  const outputDir = await ensureReportDirectory(token);
  const fileName = buildFileName(format, rangeLabel);
  const filePath = path.join(outputDir, fileName);
  return { filePath, fileName };
};

export const createMonthlyReportShare = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = monthlyReportShareSchema.parse(req.body ?? {});
  const range = resolveMonthlyRange(payload);

  const ttlDays = payload.expiresInDays ?? env.REPORT_SHARE_TTL_DAYS ?? 14;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  const token = createShareToken();

  const share = await prisma.reportShare.create({
    data: {
      token,
      startDate: range.startDate,
      endDate: range.endDate,
      createdById: req.user.id,
      expiresAt,
    },
  });

  const shareUrl = getShareUrl(req, share.token);

  return sendSuccess(
    res,
    {
      shareUrl,
      expiresAt: share.expiresAt,
      startDate: share.startDate,
      endDate: share.endDate,
    },
    "Monthly report share link created",
  );
};

export const downloadSharedReport = async (req: Request, res: Response) => {
  const token = String(req.params.token);
  const format = typeof req.query.format === "string" ? req.query.format.toLowerCase() : "pdf";

  if (!SUPPORTED_FORMATS.has(format)) {
    throw new ApiError(400, "Unsupported report format");
  }

  const share = await prisma.reportShare.findUnique({
    where: { token },
  });

  if (!share) {
    throw new ApiError(404, "Report link not found");
  }

  if (share.expiresAt < new Date()) {
    throw new ApiError(410, "Report link expired");
  }

  const reportData = await buildMonthlyReportData({
    startDate: share.startDate,
    endDate: share.endDate,
  });

  const { filePath, fileName } = await generateReportFile(token, format, reportData.rangeLabel);

  if (format === "txt") {
    await fs.promises.writeFile(filePath, renderTextReport(reportData));
  } else if (format === "csv") {
    await fs.promises.writeFile(filePath, renderCsvReport(reportData));
  } else if (format === "pdf") {
    await writePdfReport(reportData, filePath);
  } else if (format === "docx") {
    await writeDocxReport(reportData, filePath);
  }

  return res.download(filePath, fileName);
};

export const emailMonthlyReport = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = monthlyReportEmailSchema.parse(req.body ?? {});
  const range = resolveMonthlyRange(payload);

  const ttlDays = payload.expiresInDays ?? env.REPORT_SHARE_TTL_DAYS ?? 14;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  const token = createShareToken();
  const share = await prisma.reportShare.create({
    data: {
      token,
      startDate: range.startDate,
      endDate: range.endDate,
      createdById: req.user.id,
      expiresAt,
    },
  });

  const shareUrl = getShareUrl(req, share.token);
  const reportData = await buildMonthlyReportData(range);
  const { filePath, fileName } = await generateReportFile(token, payload.format, reportData.rangeLabel);

  if (payload.format === "txt") {
    await fs.promises.writeFile(filePath, renderTextReport(reportData));
  } else if (payload.format === "csv") {
    await fs.promises.writeFile(filePath, renderCsvReport(reportData));
  } else if (payload.format === "pdf") {
    await writePdfReport(reportData, filePath);
  } else if (payload.format === "docx") {
    await writeDocxReport(reportData, filePath);
  }

  await Promise.all(
    payload.recipients.map((recipient) =>
      sendAndLogEmail({
        recipient,
        templateType: EmailTemplateType.ADMIN_MONTHLY_REPORT,
        reportPeriod: reportData.rangeLabel,
        downloadUrl: shareUrl,
        attachments: [
          {
            filename: fileName,
            path: filePath,
          },
        ],
      }),
    ),
  );

  return sendSuccess(
    res,
    {
      shareUrl,
      expiresAt: share.expiresAt,
    },
    "Monthly report emailed",
  );
};
