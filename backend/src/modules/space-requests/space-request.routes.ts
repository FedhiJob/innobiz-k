import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";
import {
  approveSpaceRequest,
  createSpaceRequest,
  getSpaceRequestAdmin,
  listSpaceRequestsAdmin,
  rejectSpaceRequest,
} from "./space-request.controller";

export const spaceRequestRouter = Router();

// Public submission
spaceRequestRouter.post("/", asyncHandler(createSpaceRequest));

// Admin handling
spaceRequestRouter.get("/", requireAuth, requireRole(Role.ADMIN), asyncHandler(listSpaceRequestsAdmin));
spaceRequestRouter.get("/:id", requireAuth, requireRole(Role.ADMIN), asyncHandler(getSpaceRequestAdmin));
spaceRequestRouter.post("/:id/approve", requireAuth, requireRole(Role.ADMIN), asyncHandler(approveSpaceRequest));
spaceRequestRouter.post("/:id/reject", requireAuth, requireRole(Role.ADMIN), asyncHandler(rejectSpaceRequest));
