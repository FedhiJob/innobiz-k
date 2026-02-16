import type { NextFunction, Request, Response } from "express";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { Role } from "../generated/prisma/client";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

type AuthTokenPayload = JwtPayload & {
  sub: string;
  role: Role;
  email: string;
  name: string;
};

export const signAccessToken = (payload: {
  id: string;
  role: Role;
  email: string;
  name: string;
}) => {
  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      sub: payload.id,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    },
    env.JWT_SECRET,
    signOptions,
  );
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    return next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden");
    }

    return next();
  };
};
