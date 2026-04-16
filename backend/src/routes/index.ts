import { Router } from "express";
import { adminRouter } from "../modules/admin/admin.routes";
import { applicationRouter } from "../modules/applications/application.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { heroUpdateRouter } from "../modules/hero-updates/hero-update.routes";
import { notificationRouter } from "../modules/notifications/notification.routes";
import { officeSpaceRouter } from "../modules/office-spaces/office-space.routes";
import { reportRouter } from "../modules/reports/report.routes";
import { spaceRequestRouter } from "../modules/space-requests/space-request.routes";
import { healthRouter } from "./health.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/updates", heroUpdateRouter);
apiRouter.use("/office-spaces", officeSpaceRouter);
apiRouter.use("/applications", applicationRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/space-requests", spaceRequestRouter);
