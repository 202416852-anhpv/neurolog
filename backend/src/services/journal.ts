import * as journalRepo from "../repos/journal.js";
import type { IJournalEntry } from "../models/journal.js";
import type {
  CreateJournalInput,
  UpdateJournalInput,
} from "../validations/journal.js";

export const getJournals = async (childId?: string): Promise<IJournalEntry[]> => {
  return journalRepo.findAll(childId);
};

export const createJournal = async (
  data: CreateJournalInput,
): Promise<IJournalEntry> => {
  return journalRepo.create(data);
};

export const updateJournal = async (
  id: string,
  data: UpdateJournalInput,
): Promise<IJournalEntry | null> => {
  return journalRepo.updateById(id, data);
};

export const deleteJournal = async (id: string): Promise<IJournalEntry | null> => {
  const entry = await journalRepo.findById(id);
  if (!entry) return null;
  return journalRepo.remove(id);
};
