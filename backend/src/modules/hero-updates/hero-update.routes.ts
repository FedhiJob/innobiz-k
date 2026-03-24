import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { downloadHeroMedia, listHeroUpdatesPublic } from "./hero-update.controller";

export const heroUpdateRouter = Router();

heroUpdateRouter.get("/", asyncHandler(listHeroUpdatesPublic));
heroUpdateRouter.get("/media/:file", asyncHandler(downloadHeroMedia));
