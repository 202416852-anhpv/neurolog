import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  childId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
