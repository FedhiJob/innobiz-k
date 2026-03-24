import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { signAccessToken } from "../../middleware/auth";
import { ApiError } from "../../utils/api-error";
import { sendSuccess } from "../../utils/api-response";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.schemas";

const buildAuthPayload = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  notifyByEmail?: boolean;
  notifyInApp?: boolean;
}) => {
  const accessToken = signAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    accessToken,
  };
};

export const register = async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: Role.STARTUP,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyByEmail: true,
      notifyInApp: true,
    },
  });

  return sendSuccess(res, buildAuthPayload(user), "Registration successful", 201);
};

export const login = async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    throw new ApiError(423, "Account is temporarily locked. Try again later.");
  }

  const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isValidPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= env.LOGIN_MAX_ATTEMPTS;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockoutUntil: shouldLock
          ? new Date(Date.now() + env.LOGIN_LOCKOUT_MINUTES * 60 * 1000)
          : null,
      },
    });

    throw new ApiError(401, "Invalid email or password");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      failedLoginAttempts: 0,
      lockoutUntil: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyByEmail: true,
      notifyInApp: true,
    },
  });

  return sendSuccess(res, buildAuthPayload(updatedUser), "Login successful");
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyByEmail: true,
      notifyInApp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sendSuccess(res, user, "Current user fetched");
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const payload = updateProfileSchema.parse(req.body);

  if (payload.email) {
    const existing = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
      },
    });

    if (existing && existing.id !== req.user.id) {
      throw new ApiError(409, "Email already registered");
    }
  }

  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      name: payload.name,
      email: payload.email,
      notifyByEmail: payload.notifyByEmail,
      notifyInApp: payload.notifyInApp,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      notifyByEmail: true,
      notifyInApp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sendSuccess(res, user, "Profile updated");
};

export const logout = async (_req: Request, res: Response) => {
  return sendSuccess(
    res,
    null,
    "Logout successful. Remove the token on client side.",
  );
};
