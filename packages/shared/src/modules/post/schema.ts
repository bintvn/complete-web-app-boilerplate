import { z } from "zod";
import { categoryFieldsSchema } from "../category/fields.schema.js";
import { postFieldsSchema } from "./fields.schema.js";
import { relationMetadataSchema } from "../relation-metadata.schema.js";

const title = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => value.trim().length > 0)
  .describe("Must contain a non-whitespace character.");
const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/);
const content = z.string().optional();

export const createPostSchema = z.strictObject({
  title,
  slug,
  content,
  categories: z.array(z.uuid()).optional(),
});
export const updatePostSchema = createPostSchema.partial();
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export const postResponseSchema = postFieldsSchema.extend({
  categories: z.array(
    categoryFieldsSchema.extend(relationMetadataSchema.shape).nullable(),
  ),
});
export type PostResponse = z.infer<typeof postResponseSchema>;
