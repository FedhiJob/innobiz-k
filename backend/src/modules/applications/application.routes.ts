import { Router } from "express";
import { requireAuth } from "../../middleware/auth";

export const applicationRouter = Router();

applicationRouter.use(requireAuth);

applicationRouter.get("/", (_req, res) => {
  return res.status(501).json({
    success: false,
    data: null,
    message: "List applications endpoint not implemented yet",
  });
});
