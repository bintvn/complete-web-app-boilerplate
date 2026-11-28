import { z } from "zod";
import { baseSchema } from "../../base.schema.js";
import { commonSchema } from "../../common.schema.js";

const { name, slug, description } = commonSchema;

export const moduleBaseSchema = baseSchema
  .extend({
    name,
    code: slug,
    description: description.nullable(),
    routePath: z.string().nullable(),
  })
  .openapi("ModuleBase");

export type ModuleBaseSchema = z.infer<typeof moduleBaseSchema>;

export const createModuleSchema = z.strictObject({
  name,
  code: slug,
  description: description.nullable().optional(),
});
export const updateModuleSchema = createModuleSchema.partial();
export type CreateModule = z.infer<typeof createModuleSchema>;
export type UpdateModule = z.infer<typeof updateModuleSchema>;
