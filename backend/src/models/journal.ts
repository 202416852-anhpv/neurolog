import mongoose, { type Document, Schema, type Types } from "mongoose";

export const JOURNAL_TAGS = ["poor", "fair", "good", "great"] as const;
export type JournalTag = (typeof JOURNAL_TAGS)[number];

export interface IJournalEntry extends Document {
  childId: Types.ObjectId;
  date: Date;
  antecedent: string;
  behavior: string;
  consequence: string;
  notes: string;
  tag?: JournalTag;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournalEntry>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    date: { type: Date, required: true },
    antecedent: { type: String, required: true, trim: true, maxlength: 2000 },
    behavior: { type: String, required: true, trim: true, maxlength: 2000 },
    consequence: { type: String, required: true, trim: true, maxlength: 2000 },
    notes: { type: String, default: "", trim: true, maxlength: 2000 },
    tag: { type: String, enum: JOURNAL_TAGS },
  },
  { timestamps: true },
);

export const JournalEntry = mongoose.model<IJournalEntry>(
  "JournalEntry",
  journalSchema,
);
