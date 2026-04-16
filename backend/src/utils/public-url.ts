import type { Request } from "express";
import { env } from "../config/env";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getPublicBaseUrl = (req: Request) => {
  if (env.APP_BASE_URL) {
    return trimTrailingSlash(env.APP_BASE_URL);
  }

  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  if (!host) {
    throw new Error("Unable to resolve public host");
  }

  return `${protocol}://${host}`;
};
