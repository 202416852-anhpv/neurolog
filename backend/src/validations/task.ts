import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(100),
  childId: objectIdSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
