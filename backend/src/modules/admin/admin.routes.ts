import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";
import {
  approveApplication,
  getAdminStats,
  getApplicationAdmin,
  listApplicationsAdmin,
  rejectApplication,
} from "./admin.controller";
import { createMonthlyReportShare, emailMonthlyReport } from "../reports/report.controller";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(Role.ADMIN));

adminRouter.get("/stats", asyncHandler(getAdminStats));
adminRouter.get("/applications", asyncHandler(listApplicationsAdmin));
adminRouter.get("/applications/:id", asyncHandler(getApplicationAdmin));
adminRouter.post("/applications/:id/approve", asyncHandler(approveApplication));
adminRouter.post("/applications/:id/reject", asyncHandler(rejectApplication));
adminRouter.post("/reports/monthly/share", asyncHandler(createMonthlyReportShare));
adminRouter.post("/reports/monthly/email", asyncHandler(emailMonthlyReport));
