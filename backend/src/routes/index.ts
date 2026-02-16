import { Router } from "express";
import { adminRouter } from "../modules/admin/admin.routes";
import { applicationRouter } from "../modules/applications/application.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { healthRouter } from "./health.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/applications", applicationRouter);
apiRouter.use("/admin", adminRouter);
