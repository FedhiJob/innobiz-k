import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { downloadSharedReport } from "./report.controller";

export const reportRouter = Router();

reportRouter.get("/share/:token", asyncHandler(downloadSharedReport));
