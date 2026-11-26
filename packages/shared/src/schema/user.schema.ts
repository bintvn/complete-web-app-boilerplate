import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.email("Format email tidak valid"),
});

export const UserResponseSchema = CreateUserSchema.extend({
  id: z.uuid(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UserResponseDto = z.infer<typeof UserResponseSchema>;
