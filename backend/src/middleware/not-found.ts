import type { Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
