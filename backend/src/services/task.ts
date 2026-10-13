import * as taskRepo from "../repos/task.js";
import type { ITask } from "../models/task.js";
import type { CreateTaskInput, UpdateTaskInput } from "../validations/task.js";

export const getTasks = async (childId?: string): Promise<ITask[]> => {
  return taskRepo.findAll(childId);
};

export const createTask = async (
  data: CreateTaskInput,
): Promise<ITask> => {
  return taskRepo.create(data);
};

export const updateTask = async (
  id: string,
  data: UpdateTaskInput,
): Promise<ITask | null> => {
  return taskRepo.updateById(id, data);
};

export const submitTask = async (id: string): Promise<ITask | null> => {
  const task = await taskRepo.findById(id);
  if (!task || task.status === "done") return null;
  return taskRepo.setStatus(id, "submitted");
};

export const approveTask = async (id: string): Promise<ITask | null> => {
  const task = await taskRepo.findById(id);
  if (!task || task.status === "done") return null;
  return taskRepo.setStatus(id, "done");
};
