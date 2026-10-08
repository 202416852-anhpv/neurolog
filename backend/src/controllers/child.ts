import type { Request, Response } from "express";
import * as childService from "../services/child.js";
import { createChildSchema } from "../validations/child.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

export const getChildren = async (_req: Request, res: Response) => {
  const children = await childService.getAllChildren();
  logger.info({ count: children.length }, "Fetched children");
  res.json(children);
};

export const getChild = async (req: Request, res: Response) => {
  const child = await childService.getChildById(req.params.id as string);
  if (!child) {
    throw new AppError(ERROR_MESSAGES.CHILD_NOT_FOUND, 404);
  }
  res.json(child);
};

export const createChild = async (req: Request, res: Response) => {
  const parsed = createChildSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const child = await childService.createChild(parsed.data);
  logger.info({ id: child._id, name: child.name }, "Child created");
  res.status(201).json(child);
};

export const updateChild = async (req: Request, res: Response) => {
  const parsed = createChildSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const child = await childService.updateChild(
    req.params.id as string,
    parsed.data,
  );
  if (!child) {
    throw new AppError(ERROR_MESSAGES.CHILD_NOT_FOUND, 404);
  }
  logger.info({ id: child._id }, "Child updated");
  res.json(child);
};

export const deleteChild = async (req: Request, res: Response) => {
  const child = await childService.deleteChild(req.params.id as string);
  if (!child) {
    throw new AppError(ERROR_MESSAGES.CHILD_NOT_FOUND, 404);
  }
  logger.info({ id: req.params.id }, "Child deleted");
  res.status(204).send();
};
