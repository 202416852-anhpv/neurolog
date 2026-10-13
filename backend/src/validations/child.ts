import { z } from "zod";

export const genderEnum = z.enum(["male", "female", "other"]);

export const createChildSchema = z.object({
  name: z.string().trim().min(1).max(100),
  age: z.number().int().min(1).max(18),
  gender: genderEnum.optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải có định dạng YYYY-MM-DD")
    .optional(),
  weight: z.number().min(1).max(300).nullable().optional(),
  height: z.number().min(30).max(250).nullable().optional(),
  interests: z.string().trim().max(500).optional(),
  healthNotes: z.string().trim().max(500).optional(),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
