import { z } from "zod";
import { commonSchema } from "../../core/common.schema.js";
import { categoryBaseSchema } from "./fields.schema.js";

const { name, slug } = commonSchema;
export const createCategorySchema = z.strictObject({
  name,
  slug,
});
export const updateCategorySchema = createCategorySchema.partial();
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export const categoryResponseSchema = categoryBaseSchema;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
