import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { requireAuth } from "../../middleware/auth";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", asyncHandler(listNotifications));
notificationRouter.patch("/mark-read", asyncHandler(markNotificationsRead));
notificationRouter.patch("/mark-all-read", asyncHandler(markAllNotificationsRead));
