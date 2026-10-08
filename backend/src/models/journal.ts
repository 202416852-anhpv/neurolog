import mongoose, { type Document, Schema, type Types } from "mongoose";

export interface IJournalEntry extends Document {
  childId: Types.ObjectId;
  date: Date;
  antecedent: string;
  behavior: string;
  consequence: string;
  notes: string;
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
  },
  { timestamps: true },
);

export const JournalEntry = mongoose.model<IJournalEntry>(
  "JournalEntry",
  journalSchema,
);
