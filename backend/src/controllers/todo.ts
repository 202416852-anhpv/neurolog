import type { Request, Response } from "express";
import * as todoService from "../services/todo.js";
import { createTodoSchema } from "../validations/todo.js";
import { AppError, ERROR_MESSAGES } from "../errors/index.js";
import logger from "../logger/index.js";

export const getTodos = async (_req: Request, res: Response) => {
  const todos = await todoService.getAllTodos();
  logger.info({ count: todos.length }, "Fetched todos");
  res.json(todos);
};

export const createTodo = async (req: Request, res: Response) => {
  const parsed = createTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, 400);
  }
  const todo = await todoService.createTodo(parsed.data.title);
  logger.info({ id: todo._id, title: todo.title }, "Todo created");
  res.status(201).json(todo);
};

export const deleteTodo = async (req: Request, res: Response) => {
  const todo = await todoService.deleteTodo(req.params.id as string);
  if (!todo) {
    throw new AppError(ERROR_MESSAGES.TODO_NOT_FOUND, 404);
  }
  logger.info({ id: req.params.id }, "Todo deleted");
  res.status(204).send();
};

export const toggleTodo = async (req: Request, res: Response) => {
  const todo = await todoService.toggleTodo(req.params.id as string);
  if (!todo) {
    throw new AppError(ERROR_MESSAGES.TODO_NOT_FOUND, 404);
  }
  logger.info({ id: todo._id, completed: todo.completed }, "Todo toggled");
  res.json(todo);
};
