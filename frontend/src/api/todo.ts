import axios from "axios";
import type { Todo } from "../types/todo";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const fetchTodos = async (): Promise<Todo[]> => {
  const { data } = await api.get<Todo[]>("/");
  return data;
};

export const createTodo = async (title: string): Promise<Todo> => {
  const { data } = await api.post<Todo>("/", { title });
  return data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await api.delete(`/${id}`);
};

export const toggleTodo = async (id: string): Promise<Todo> => {
  const { data } = await api.post<Todo>(`/${id}/toggle`);
  return data;
};
