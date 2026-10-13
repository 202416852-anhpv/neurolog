import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createParentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  age: z.number().int().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateParentInput = z.infer<typeof createParentSchema>;

export const linkChildSchema = z.object({
  childId: objectIdSchema,
});

export type LinkChildInput = z.infer<typeof linkChildSchema>;
