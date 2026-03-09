import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";
import {
  createApplication,
  deleteApplicationDraft,
  getApplicationById,
  listApplications,
  submitApplication,
  updateApplication,
} from "./application.controller";
import { deleteDocument, downloadDocument, uploadDocument } from "./document.controller";
import { upload } from "./document.upload";

export const applicationRouter = Router();

applicationRouter.use(requireAuth);

applicationRouter.post("/", requireRole(Role.STARTUP), asyncHandler(createApplication));
applicationRouter.get("/", requireRole(Role.STARTUP), asyncHandler(listApplications));
applicationRouter.get("/:id", requireRole(Role.STARTUP), asyncHandler(getApplicationById));
applicationRouter.patch("/:id", requireRole(Role.STARTUP), asyncHandler(updateApplication));
applicationRouter.delete("/:id", requireRole(Role.STARTUP), asyncHandler(deleteApplicationDraft));
applicationRouter.post("/:id/submit", requireRole(Role.STARTUP), asyncHandler(submitApplication));

applicationRouter.post(
  "/:id/documents",
  requireRole(Role.STARTUP),
  upload.single("file"),
  asyncHandler(uploadDocument),
);
applicationRouter.get(
  "/:id/documents/:docId",
  requireRole(Role.STARTUP, Role.ADMIN),
  asyncHandler(downloadDocument),
);
applicationRouter.delete(
  "/:id/documents/:docId",
  requireRole(Role.STARTUP, Role.ADMIN),
  asyncHandler(deleteDocument),
);
