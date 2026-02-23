import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";
import {
  createApplication,
  getApplicationById,
  listApplications,
  submitApplication,
  updateApplication,
} from "./application.controller";

export const applicationRouter = Router();

applicationRouter.use(requireAuth, requireRole(Role.STARTUP));

applicationRouter.post("/", asyncHandler(createApplication));
applicationRouter.get("/", asyncHandler(listApplications));
applicationRouter.get("/:id", asyncHandler(getApplicationById));
applicationRouter.patch("/:id", asyncHandler(updateApplication));
applicationRouter.post("/:id/submit", asyncHandler(submitApplication));
