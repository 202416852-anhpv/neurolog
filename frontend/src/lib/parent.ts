import { fetchParent } from "@/api/parent";
import type { Parent } from "@/types/parent";

export const PARENT_ID_KEY = "neurolog.parentId";

export const getStoredParentId = (): string | null => {
  return localStorage.getItem(PARENT_ID_KEY);
};

export const storeParentId = (id: string): void => {
  localStorage.setItem(PARENT_ID_KEY, id);
};

export const clearStoredParentId = (): void => {
  localStorage.removeItem(PARENT_ID_KEY);
};

export const fetchCurrentParent = async (): Promise<Parent | null> => {
  const id = getStoredParentId();
  if (!id) return null;
  try {
    return await fetchParent(id);
  } catch {
    clearStoredParentId();
    return null;
  }
};
