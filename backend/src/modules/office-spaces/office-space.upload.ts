import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { ApiError } from "../../utils/api-error";

const uploadsDir = path.resolve(process.cwd(), "uploads", "office-spaces");

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const maxFileSize = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
    cb(new ApiError(400, "Unsupported file type. Upload a JPG, PNG, or WEBP image."));
    return;
  }

  cb(null, true);
};

export const officeSpaceImageUpload = multer({
  storage,
  limits: {
    fileSize: maxFileSize + 1024 * 1024,
  },
  fileFilter,
});
