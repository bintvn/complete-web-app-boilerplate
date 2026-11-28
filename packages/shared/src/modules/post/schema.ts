import { z } from "zod";
import { baseSchema } from "../../core/base.schema.js";
import {
  categoryBaseSchema,
  CategorySchema,
} from "../category/fields.schema.js";
import {
  userBaseSchema,
  UserBaseSchema,
} from "../../core/modules/user/user.schema.js";

export const postBaseSchema = baseSchema
  .extend({
    title: z.string(),
    slug: z.string(),
    content: z.string().nullable().optional(),
  })
  .openapi("PostBase");

export type PostBaseSchema = z.infer<typeof postBaseSchema>;
export type PostSchema = PostBaseSchema & {
  categories: CategorySchema[];
  user: UserBaseSchema;
};

export const postSchema: z.ZodType<PostSchema> = postBaseSchema
  .extend({
    get categories() {
      return categoryBaseSchema.array();
    },
    get user() {
      return userBaseSchema;
    },
  })
  .openapi("Post");

export const createPostSchema = z.strictObject({
  title: postBaseSchema.shape.title,
  slug: postBaseSchema.shape.title,
  content: postBaseSchema.shape.content,
  categories: z.array(z.uuid()).optional(),
});
export const updatePostSchema = createPostSchema.partial();
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;

export const postResponseSchema = postSchema;
export type PostResponse = z.infer<typeof postResponseSchema>;
