import api from "./client";
import type { Task, TaskInput } from "../types/task";

export const fetchTasks = async (childId?: string): Promise<Task[]> => {
  const { data } = await api.get<Task[]>("/tasks", {
    params: childId ? { childId } : undefined,
  });
  return data;
};

export const createTask = async (input: TaskInput): Promise<Task> => {
  const { data } = await api.post<Task>("/tasks", input);
  return data;
};

export const submitTask = async (id: string): Promise<Task> => {
  const { data } = await api.post<Task>(`/tasks/${id}/submit`);
  return data;
};

export const approveTask = async (id: string): Promise<Task> => {
  const { data } = await api.post<Task>(`/tasks/${id}/approve`);
  return data;
};
