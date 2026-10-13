import type { Request, Response } from "express";
import * as parentService from "../services/parent.js";
import { createParentSchema, linkChildSchema } from "../validations/parent.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

export const getParent = async (req: Request, res: Response) => {
  const parent = await parentService.getParentById(req.params.id as string);
  if (!parent) {
    throw new AppError(ERROR_MESSAGES.PARENT_NOT_FOUND, 404);
  }
  res.json(parent);
};

export const createParent = async (req: Request, res: Response) => {
  const parsed = createParentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const parent = await parentService.createParent(parsed.data);
  logger.info({ id: parent._id, name: parent.name }, "Parent created");
  res.status(201).json(parent);
};

export const updateParent = async (req: Request, res: Response) => {
  const parsed = createParentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const parent = await parentService.updateParent(
    req.params.id as string,
    parsed.data,
  );
  if (!parent) {
    throw new AppError(ERROR_MESSAGES.PARENT_NOT_FOUND, 404);
  }
  logger.info({ id: parent._id }, "Parent updated");
  res.json(parent);
};

export const deleteParent = async (req: Request, res: Response) => {
  const parent = await parentService.deleteParent(req.params.id as string);
  if (!parent) {
    throw new AppError(ERROR_MESSAGES.PARENT_NOT_FOUND, 404);
  }
  logger.info({ id: req.params.id }, "Parent deleted");
  res.status(204).send();
};

export const linkChild = async (req: Request, res: Response) => {
  const parsed = linkChildSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const parentId = req.params.id as string;
  const existing = await parentService.getParentById(parentId);
  if (!existing) {
    throw new AppError(ERROR_MESSAGES.PARENT_NOT_FOUND, 404);
  }
  const { parent, childExists } = await parentService.linkChild(
    parentId,
    parsed.data.childId,
  );
  if (!childExists) {
    throw new AppError(ERROR_MESSAGES.CHILD_NOT_FOUND, 404);
  }
  logger.info({ parentId, childId: parsed.data.childId }, "Child linked");
  res.json(parent);
};

export const unlinkChild = async (req: Request, res: Response) => {
  const parentId = req.params.id as string;
  const childId = req.params.childId as string;
  const parent = await parentService.unlinkChild(parentId, childId);
  if (!parent) {
    throw new AppError(ERROR_MESSAGES.PARENT_NOT_FOUND, 404);
  }
  logger.info({ parentId, childId }, "Child unlinked");
  res.json(parent);
};
