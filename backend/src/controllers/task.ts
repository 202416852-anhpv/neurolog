import type { Request, Response } from "express";
import * as taskService from "../services/task.js";
import { createTaskSchema } from "../validations/task.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

export const getTasks = async (req: Request, res: Response) => {
  const childId =
    typeof req.query.childId === "string" ? req.query.childId : undefined;
  const tasks = await taskService.getTasks(childId);
  logger.info({ count: tasks.length }, "Fetched tasks");
  res.json(tasks);
};

export const createTask = async (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const task = await taskService.createTask(parsed.data);
  logger.info({ id: task._id, title: task.title }, "Task created");
  res.status(201).json(task);
};

export const submitTask = async (req: Request, res: Response) => {
  const task = await taskService.submitTask(req.params.id as string);
  if (!task) {
    throw new AppError(ERROR_MESSAGES.TASK_NOT_FOUND, 404);
  }
  logger.info({ id: task._id }, "Task submitted");
  res.json(task);
};

export const approveTask = async (req: Request, res: Response) => {
  const task = await taskService.approveTask(req.params.id as string);
  if (!task) {
    throw new AppError(ERROR_MESSAGES.TASK_NOT_FOUND, 404);
  }
  logger.info({ id: task._id }, "Task approved");
  res.json(task);
};
