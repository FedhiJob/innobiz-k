import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";
import { login, logout, me, register, updateProfile } from "./auth.controller";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: "Too many login attempts. Please try again later.",
  },
});

authRouter.post("/register", asyncHandler(register));
authRouter.post(
  "/login",
  ...(env.NODE_ENV === "test" ? [] : [loginLimiter]),
  asyncHandler(login),
);
authRouter.post("/logout", asyncHandler(logout));
authRouter.get("/me", requireAuth, asyncHandler(me));
authRouter.patch("/me", requireAuth, asyncHandler(updateProfile));
