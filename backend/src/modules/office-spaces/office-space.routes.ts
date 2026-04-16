import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { getOfficeSpacePublic, listOfficeSpacesPublic } from "./office-space.controller";

export const officeSpaceRouter = Router();

officeSpaceRouter.get("/", asyncHandler(listOfficeSpacesPublic));
officeSpaceRouter.get("/:slug", asyncHandler(getOfficeSpacePublic));
