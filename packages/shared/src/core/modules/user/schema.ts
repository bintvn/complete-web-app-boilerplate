import { z } from "zod";
import { baseResponseSchema } from "../../base-response.schema.js";

const name = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => value.trim().length > 0);
const email = z.string().trim().toLowerCase().max(255).check(z.email());
const password = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => value.trim().length > 0, {
    error: "Password must contain a non-whitespace character",
  });
const roleId = z.uuid();

export const createUserSchema = z.strictObject({
  isEmailVerified: z.boolean().optional(),
  name,
  email,
  password,
  roleId,
});
export const updateUserSchema = createUserSchema.partial();
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export const userResponseSchema = baseResponseSchema.extend({
  isEmailVerified: z.boolean(),
  name: z.string(),
  email: z.string(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;
