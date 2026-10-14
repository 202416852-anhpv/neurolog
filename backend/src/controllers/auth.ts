import type { Request, Response } from "express";
import * as authService from "../services/auth.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import { loginSchema } from "../validations/auth.js";
import { createParentSchema } from "../validations/parent.js";
import { createChildSchema } from "../validations/child.js";
import logger from "../logger/index.js";

const readClaims = (req: Request): authService.TokenClaims => {
  return authService.getClaimsFromHeader(req.headers.authorization);
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const result = await authService.login(parsed.data.role, parsed.data.credential);
  logger.info({ role: parsed.data.role }, "Google login");
  res.json(result);
};

export const completeProfile = async (req: Request, res: Response) => {
  const claims = readClaims(req);
  if (claims.role === "parent") {
    const parsed = createParentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }
    const parent = await authService.completeParentProfile(claims, parsed.data);
    logger.info({ id: parent._id }, "Parent profile completed");
    res.status(201).json({ role: claims.role, profile: parent });
    return;
  }
  const parsed = createChildSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const child = await authService.completeChildProfile(claims, parsed.data);
  logger.info({ id: child._id }, "Child profile completed");
  res.status(201).json({ role: claims.role, profile: child });
};

export const me = async (req: Request, res: Response) => {
  const claims = readClaims(req);
  const result = await authService.getMe(claims);
  res.json(result);
};
