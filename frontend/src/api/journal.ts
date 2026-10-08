import api from "./client";
import type { JournalEntry, JournalInput } from "../types/journal";

export const fetchJournals = async (childId?: string): Promise<JournalEntry[]> => {
  const { data } = await api.get<JournalEntry[]>("/journals", {
    params: childId ? { childId } : undefined,
  });
  return data;
};

export const createJournal = async (input: JournalInput): Promise<JournalEntry> => {
  const { data } = await api.post<JournalEntry>("/journals", input);
  return data;
};

export const deleteJournal = async (id: string): Promise<void> => {
  await api.delete(`/journals/${id}`);
};
