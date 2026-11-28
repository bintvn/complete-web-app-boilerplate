import { z } from "zod";
import { baseSchema } from "../../core/base.schema.js";
import { postBaseSchema, PostBaseSchema } from "../post/schema.js";

export const categoryBaseSchema = baseSchema
  .extend({
    name: z.string(),
    slug: z.string(),
  })
  .openapi("CategoryBase");

export type CategorySchema = z.infer<typeof categoryBaseSchema> & {
  posts?: PostBaseSchema[];
};

export const categorySchema: z.ZodType<CategorySchema> = categoryBaseSchema
  .extend({
    get posts() {
      return postBaseSchema.array().optional();
    },
  })
  .openapi("Category");
