import { z } from "zod";
import { JOURNAL_TAGS } from "../models/journal.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
const tagSchema = z.enum(JOURNAL_TAGS);

export const createJournalSchema = z.object({
  childId: objectIdSchema,
  date: z.coerce.date(),
  antecedent: z.string().trim().min(1).max(2000),
  behavior: z.string().trim().min(1).max(2000),
  consequence: z.string().trim().min(1).max(2000),
  notes: z.string().trim().max(2000).optional().default(""),
  tag: tagSchema,
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;

export const updateJournalSchema = z
  .object({
    date: z.coerce.date().optional(),
    antecedent: z.string().trim().min(1).max(2000).optional(),
    behavior: z.string().trim().min(1).max(2000).optional(),
    consequence: z.string().trim().min(1).max(2000).optional(),
    notes: z.string().trim().max(2000).optional(),
    tag: tagSchema.optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some((value) => value !== undefined),
    { message: "Cần ít nhất một trường để cập nhật" },
  );

export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;

export const journalQuerySchema = z
  .object({
    childId: objectIdSchema.optional(),
    tag: tagSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      !(data.from && data.to) || data.from.getTime() <= data.to.getTime(),
    { message: "from phải nhỏ hơn hoặc bằng to" },
  );

export type JournalQueryInput = z.infer<typeof journalQuerySchema>;
