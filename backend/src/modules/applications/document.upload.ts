import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { ApiError } from "../../utils/api-error";

const uploadsDir = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".ppt", ".pptx"]);

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

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.has(ext) || !allowedMimeTypes.has(file.mimetype)) {
    return cb(new ApiError(400, "Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX."));
  }

  return cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});
