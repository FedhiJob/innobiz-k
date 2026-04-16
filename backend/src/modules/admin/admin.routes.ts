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
import {
  createHeroUpdate,
  deleteHeroUpdate,
  listHeroUpdatesAdmin,
  updateHeroUpdate,
} from "../hero-updates/hero-update.controller";
import { heroMediaUpload } from "../hero-updates/hero-update.upload";
import {
  createOfficeSpace,
  deleteOfficeSpace,
  listOfficeSpacesAdmin,
  updateOfficeSpace,
} from "../office-spaces/office-space.controller";
import { officeSpaceImageUpload } from "../office-spaces/office-space.upload";
import { createMonthlyReportShare, emailMonthlyReport } from "../reports/report.controller";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(Role.ADMIN));

adminRouter.get("/stats", asyncHandler(getAdminStats));
adminRouter.get("/applications", asyncHandler(listApplicationsAdmin));
adminRouter.get("/applications/:id", asyncHandler(getApplicationAdmin));
adminRouter.post("/applications/:id/approve", asyncHandler(approveApplication));
adminRouter.post("/applications/:id/reject", asyncHandler(rejectApplication));
adminRouter.get("/hero-updates", asyncHandler(listHeroUpdatesAdmin));
adminRouter.post("/hero-updates", heroMediaUpload.single("media"), asyncHandler(createHeroUpdate));
adminRouter.patch("/hero-updates/:id", heroMediaUpload.single("media"), asyncHandler(updateHeroUpdate));
adminRouter.delete("/hero-updates/:id", asyncHandler(deleteHeroUpdate));
adminRouter.get("/office-spaces", asyncHandler(listOfficeSpacesAdmin));
adminRouter.post("/office-spaces", officeSpaceImageUpload.single("image"), asyncHandler(createOfficeSpace));
adminRouter.patch("/office-spaces/:id", officeSpaceImageUpload.single("image"), asyncHandler(updateOfficeSpace));
adminRouter.delete("/office-spaces/:id", asyncHandler(deleteOfficeSpace));
adminRouter.post("/reports/monthly/share", asyncHandler(createMonthlyReportShare));
adminRouter.post("/reports/monthly/email", asyncHandler(emailMonthlyReport));
