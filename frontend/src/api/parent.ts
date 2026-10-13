import api from "./client";
import type { Parent, ParentInput } from "@/types/parent";

export const fetchParent = async (id: string): Promise<Parent> => {
  const { data } = await api.get<Parent>(`/parents/${id}`);
  return data;
};

export const createParent = async (input: ParentInput): Promise<Parent> => {
  const { data } = await api.post<Parent>("/parents", input);
  return data;
};

export const updateParent = async (
  id: string,
  input: ParentInput,
): Promise<Parent> => {
  const { data } = await api.put<Parent>(`/parents/${id}`, input);
  return data;
};

export const deleteParent = async (id: string): Promise<void> => {
  await api.delete(`/parents/${id}`);
};

export const linkChild = async (
  parentId: string,
  childId: string,
): Promise<Parent> => {
  const { data } = await api.post<Parent>(`/parents/${parentId}/children`, {
    childId,
  });
  return data;
};

export const unlinkChild = async (
  parentId: string,
  childId: string,
): Promise<Parent> => {
  const { data } = await api.delete<Parent>(
    `/parents/${parentId}/children/${childId}`,
  );
  return data;
};
