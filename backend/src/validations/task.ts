import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const taskStatusEnum = z.enum(["pending", "submitted", "done"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(100),
  childId: objectIdSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    status: taskStatusEnum.optional(),
  })
  .refine((data) => data.title !== undefined || data.status !== undefined, {
    message: "Cần ít nhất một trường để cập nhật",
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
