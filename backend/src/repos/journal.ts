import mongoose from "mongoose";
import { JournalEntry, type IJournalEntry } from "../models/journal.js";
import type { CreateJournalInput } from "../validations/journal.js";

export const findAll = async (childId?: string): Promise<IJournalEntry[]> => {
  const filter = childId ? { childId } : {};
  return JournalEntry.find(filter).sort({ date: -1 });
};

export const create = async (
  data: CreateJournalInput,
): Promise<IJournalEntry> => {
  return JournalEntry.create({
    childId: new mongoose.Types.ObjectId(data.childId),
    date: data.date,
    antecedent: data.antecedent,
    behavior: data.behavior,
    consequence: data.consequence,
    notes: data.notes,
  });
};

export const findById = async (id: string): Promise<IJournalEntry | null> => {
  return JournalEntry.findById(id);
};

export const remove = async (id: string): Promise<IJournalEntry | null> => {
  return JournalEntry.findByIdAndDelete(id);
};
