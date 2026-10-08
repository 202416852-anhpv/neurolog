import type { Request, Response, NextFunction } from "express";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    logger.warn({ err, method: req.method, url: req.originalUrl }, err.message);
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err.name === "CastError") {
    logger.warn({ err, method: req.method, url: req.originalUrl }, ERROR_MESSAGES.INVALID_ID_FORMAT);
    res.status(400).json({ message: ERROR_MESSAGES.INVALID_ID_FORMAT });
    return;
  }

  logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled error");
  res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
};
