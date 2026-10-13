import mongoose from "mongoose";
import { Task, type ITask, type TaskStatus } from "../models/task.js";
import type { CreateTaskInput, UpdateTaskInput } from "../validations/task.js";

export const findAll = async (childId?: string): Promise<ITask[]> => {
  const filter = childId ? { childId } : {};
  return Task.find(filter).sort({ createdAt: -1 });
};

export const create = async (data: CreateTaskInput): Promise<ITask> => {
  return Task.create({
    title: data.title,
    childId: new mongoose.Types.ObjectId(data.childId),
  });
};

export const findById = async (id: string): Promise<ITask | null> => {
  return Task.findById(id);
};

export const updateById = async (
  id: string,
  data: UpdateTaskInput,
): Promise<ITask | null> => {
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.status !== undefined) update.status = data.status;
  return Task.findByIdAndUpdate(id, update, { new: true });
};

export const setStatus = async (
  id: string,
  status: TaskStatus,
): Promise<ITask | null> => {
  return Task.findByIdAndUpdate(id, { status }, { new: true });
};

export const deleteByChildId = async (
  childId: string,
): Promise<number> => {
  const result = await Task.deleteMany({
    childId: new mongoose.Types.ObjectId(childId),
  });
  return result.deletedCount ?? 0;
};
