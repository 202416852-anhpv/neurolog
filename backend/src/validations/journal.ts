import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createJournalSchema = z.object({
  childId: objectIdSchema,
  date: z.coerce.date(),
  antecedent: z.string().trim().min(1).max(2000),
  behavior: z.string().trim().min(1).max(2000),
  consequence: z.string().trim().min(1).max(2000),
  notes: z.string().trim().max(2000).optional().default(""),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
