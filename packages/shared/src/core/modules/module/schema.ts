import { z } from "zod";
import { baseResponseSchema } from "../../base-response.schema.js";
import { descriptionSchema } from "../../validation.schema.js";

const name = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => value.trim().length > 0);
const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/);

export const createModuleSchema = z.strictObject({
  name,
  slug,
  description: descriptionSchema,
});
export const updateModuleSchema = createModuleSchema.partial();
export type CreateModule = z.infer<typeof createModuleSchema>;
export type UpdateModule = z.infer<typeof updateModuleSchema>;

export const moduleResponseSchema = baseResponseSchema.extend({
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  routePath: z.string().nullable(),
});
export type ModuleResponse = z.infer<typeof moduleResponseSchema>;
