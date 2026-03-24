import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { ApiError } from "../../utils/api-error";

const uploadsDir = path.resolve(process.cwd(), "uploads", "hero-updates");

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"]);

const maxFileSize = 25 * 1024 * 1024;

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
  if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
    cb(new ApiError(400, "Unsupported file type. Upload an image or video."));
    return;
  }
  cb(null, true);
};

export const heroMediaUpload = multer({
  storage,
  limits: {
    fileSize: maxFileSize + 1024 * 1024,
  },
  fileFilter,
});

export const heroMediaConfig = {
  maxFileSize,
  allowedExtensions,
  allowedMimeTypes,
};
