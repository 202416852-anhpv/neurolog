import { z } from "zod";

export const loginSchema = z.object({
  credential: z.string().trim().min(1),
  role: z.enum(["parent", "child"]),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type AuthRole = LoginInput["role"];
