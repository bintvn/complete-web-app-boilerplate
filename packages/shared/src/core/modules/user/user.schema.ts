import z from "zod";
import { baseSchema } from "../../base.schema.js";
import {
  SessionBaseSchema,
  sessionBaseSchema,
} from "../auth/session.schema.js";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { commonSchema } from "../../common.schema.js";
import {
  postBaseSchema,
  PostBaseSchema,
} from "../../../modules/post/schema.js";

extendZodWithOpenApi(z);

const { name, email } = commonSchema;

export const userBaseSchema = baseSchema
  .extend({
    isEmailVerified: z.boolean(),
    name,
    email,
  })
  .openapi("UserBase");

export type UserBaseSchema = z.infer<typeof userBaseSchema>;

export type UserSchema = UserBaseSchema & {
  sessions: SessionBaseSchema[];
  posts: PostBaseSchema[];
};

export const userSchema: z.ZodType<UserSchema> = userBaseSchema
  .extend({
    get sessions() {
      return sessionBaseSchema.array();
    },
    get posts() {
      return postBaseSchema.array();
    },
  })
  .openapi("User");
