import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { documentUploadConfig } from "./document.upload";

const uploadsDir = path.resolve(process.cwd(), "uploads", "monthly-reports");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, _file, cb) => cb(null, true);

export const monthlyReportUpload = multer({
  storage,
  limits: {
    fileSize: documentUploadConfig.maxFileSize + 1024 * 1024,
  },
  fileFilter,
});
