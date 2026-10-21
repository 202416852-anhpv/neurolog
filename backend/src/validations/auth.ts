import { z } from "zod";

const roleSchema = z.enum(["parent", "child"]);

export const loginSchema = z.object({
  credential: z.string().trim().min(1),
  role: roleSchema,
});

export const passwordLoginSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(30),
  password: z.string().min(8).max(72),
  role: roleSchema,
});

export const registerSchema = z
  .object({
    role: roleSchema,
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(30)
      .regex(
        /^[a-z0-9._-]+$/,
        "Tên đăng nhập chỉ gồm chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang",
      ),
    password: z.string().min(8).max(72),
    name: z.string().trim().min(1).max(100),
    age: z.number().int().min(1).max(100),
    email: z.string().trim().email().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "parent" && !data.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Phụ huynh cần nhập email",
      });
    }
    if (data.role === "child" && data.age > 18) {
      ctx.addIssue({
        code: "custom",
        path: ["age"],
        message: "Tuổi của trẻ phải từ 1 đến 18",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthRole = LoginInput["role"];
