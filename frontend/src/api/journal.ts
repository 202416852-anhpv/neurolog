import api from "./client";
import type {
  JournalEntry,
  JournalInput,
  JournalQuery,
} from "../types/journal";

export const fetchJournals = async (
  params: JournalQuery = {},
): Promise<JournalEntry[]> => {
  const { data } = await api.get<JournalEntry[]>("/journals", {
    params: Object.keys(params).length > 0 ? params : undefined,
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
