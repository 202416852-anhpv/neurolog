import { z } from "zod";

export const createChildSchema = z.object({
  name: z.string().trim().min(1).max(100),
  age: z.number().int().min(1).max(18),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
