import api from "./client";
import type { Child, ChildInput } from "@/types/child";

export const fetchChildren = async (): Promise<Child[]> => {
  const { data } = await api.get<Child[]>("/children");
  return data;
};

export const fetchChild = async (id: string): Promise<Child> => {
  const { data } = await api.get<Child>(`/children/${id}`);
  return data;
};

export const createChild = async (input: ChildInput): Promise<Child> => {
  const { data } = await api.post<Child>("/children", input);
  return data;
};

export const updateChild = async (
  id: string,
  input: ChildInput,
): Promise<Child> => {
  const { data } = await api.post<Child>(`/children/${id}`, input);
  return data;
};

export const deleteChild = async (id: string): Promise<void> => {
  await api.delete(`/children/${id}`);
};
