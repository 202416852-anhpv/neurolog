import type { Request, Response, NextFunction } from "express";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";

const BUCKET_CAPACITY = 50;
const REFILL_RATE = 10;

let tokens = BUCKET_CAPACITY;
let lastRefillTime = Date.now();

export const rateLimiter = (req: Request, _res: Response, next: NextFunction) => {
  const now = Date.now();
  const elapsed = now - lastRefillTime;
  const refill = (elapsed * REFILL_RATE) / 1000;

  tokens = Math.min(BUCKET_CAPACITY, tokens + refill);
  lastRefillTime = now;

  if (tokens >= 1) {
    tokens--;
    _res.setHeader("X-RateLimit-Limit", BUCKET_CAPACITY);
    _res.setHeader("X-RateLimit-Remaining", Math.floor(tokens));
    _res.setHeader("X-RateLimit-Reset", Math.ceil(lastRefillTime / 1000 + 1));
    next();
  } else {
    _res.setHeader("X-RateLimit-Limit", BUCKET_CAPACITY);
    _res.setHeader("X-RateLimit-Remaining", 0);
    _res.setHeader("X-RateLimit-Reset", Math.ceil(lastRefillTime / 1000 + 1));
    throw new AppError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, 429);
  }
};
