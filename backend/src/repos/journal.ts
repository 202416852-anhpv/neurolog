import mongoose from "mongoose";
import { JournalEntry, type IJournalEntry } from "../models/journal.js";
import type {
  CreateJournalInput,
  UpdateJournalInput,
} from "../validations/journal.js";

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

export const updateById = async (
  id: string,
  data: UpdateJournalInput,
): Promise<IJournalEntry | null> => {
  const update: Record<string, unknown> = {};
  if (data.date !== undefined) update.date = data.date;
  if (data.antecedent !== undefined) update.antecedent = data.antecedent;
  if (data.behavior !== undefined) update.behavior = data.behavior;
  if (data.consequence !== undefined) update.consequence = data.consequence;
  if (data.notes !== undefined) update.notes = data.notes;
  return JournalEntry.findByIdAndUpdate(id, update, { new: true });
};

export const remove = async (id: string): Promise<IJournalEntry | null> => {
  return JournalEntry.findByIdAndDelete(id);
};

export const deleteByChildId = async (childId: string): Promise<number> => {
  const result = await JournalEntry.deleteMany({
    childId: new mongoose.Types.ObjectId(childId),
  });
  return result.deletedCount ?? 0;
};
