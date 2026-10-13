import type { Request, Response, NextFunction } from "express";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";

const BUCKET_CAPACITY = 50;
const REFILL_RATE = 10;
const MAX_BUCKETS = 10_000;

interface Bucket {
  tokens: number;
  lastRefillTime: number;
}

const buckets = new Map<string, Bucket>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const key = req.ip ?? "unknown";
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) {
      buckets.clear();
    }
    bucket = { tokens: BUCKET_CAPACITY, lastRefillTime: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefillTime;
  const refill = (elapsed * REFILL_RATE) / 1000;
  bucket.tokens = Math.min(BUCKET_CAPACITY, bucket.tokens + refill);
  bucket.lastRefillTime = now;

  res.setHeader("X-RateLimit-Limit", BUCKET_CAPACITY);
  res.setHeader("X-RateLimit-Reset", Math.ceil(now / 1000 + 1));

  if (bucket.tokens >= 1) {
    bucket.tokens--;
    res.setHeader("X-RateLimit-Remaining", Math.floor(bucket.tokens));
    next();
  } else {
    res.setHeader("X-RateLimit-Remaining", 0);
    throw new AppError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, 429);
  }
};
