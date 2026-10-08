import { Todo, type ITodo } from "../models/todo.js";

export const findAll = async (): Promise<ITodo[]> => {
  return Todo.find().sort({ createdAt: -1 });
};

export const create = async (data: { title: string }): Promise<ITodo> => {
  return Todo.create(data);
};

export const findById = async (id: string): Promise<ITodo | null> => {
  return Todo.findById(id);
};

export const deleteById = async (id: string): Promise<ITodo | null> => {
  return Todo.findByIdAndDelete(id);
};

export const updateById = async (
  id: string,
  data: Partial<Pick<ITodo, "title" | "completed">>,
): Promise<ITodo | null> => {
  return Todo.findByIdAndUpdate(id, data, { new: true });
};
