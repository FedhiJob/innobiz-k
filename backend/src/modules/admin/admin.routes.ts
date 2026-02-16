import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(Role.ADMIN));

adminRouter.get("/stats", (_req, res) => {
  return res.status(501).json({
    success: false,
    data: null,
    message: "Admin stats endpoint not implemented yet",
  });
});
