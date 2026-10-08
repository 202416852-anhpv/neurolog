import * as todoRepo from "../repos/todo.js";
import type { ITodo } from "../models/todo.js";

export const getAllTodos = async (): Promise<ITodo[]> => {
  return todoRepo.findAll();
};

export const createTodo = async (title: string): Promise<ITodo> => {
  return todoRepo.create({ title });
};

export const deleteTodo = async (id: string): Promise<ITodo | null> => {
  return todoRepo.deleteById(id);
};

export const toggleTodo = async (id: string): Promise<ITodo | null> => {
  const todo = await todoRepo.findById(id);
  if (!todo) return null;
  return todoRepo.updateById(id, { completed: !todo.completed });
};
