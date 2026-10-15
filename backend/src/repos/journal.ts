import mongoose from "mongoose";
import { JournalEntry, type IJournalEntry } from "../models/journal.js";
import type {
  CreateJournalInput,
  JournalQueryInput,
  UpdateJournalInput,
} from "../validations/journal.js";

export const findAll = async (
  query: JournalQueryInput = {},
): Promise<IJournalEntry[]> => {
  const filter: Record<string, unknown> = {};
  if (query.childId) {
    filter.childId = new mongoose.Types.ObjectId(query.childId);
  }
  if (query.tag) {
    filter.tag = query.tag;
  }
  if (query.from || query.to) {
    const date: Record<string, Date> = {};
    if (query.from) date.$gte = query.from;
    if (query.to) {
      const endOfDay = new Date(query.to);
      endOfDay.setDate(endOfDay.getDate() + 1);
      date.$lt = endOfDay;
    }
    filter.date = date;
  }
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
    tag: data.tag,
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
  if (data.tag !== undefined) update.tag = data.tag;
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
