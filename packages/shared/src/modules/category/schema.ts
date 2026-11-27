import { z } from "zod";
import { postFieldsSchema } from "../post/fields.schema.js";
import { categoryFieldsSchema } from "./fields.schema.js";
import { relationMetadataSchema } from "../relation-metadata.schema.js";

const name = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => value.trim().length > 0)
  .describe("Must contain a non-whitespace character.");
const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/);

export const createCategorySchema = z.strictObject({
  name,
  slug,
});
export const updateCategorySchema = createCategorySchema.partial();
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export const categoryResponseSchema = categoryFieldsSchema.extend({
  posts: z.array(
    postFieldsSchema.extend(relationMetadataSchema.shape).nullable(),
  ),
});
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
