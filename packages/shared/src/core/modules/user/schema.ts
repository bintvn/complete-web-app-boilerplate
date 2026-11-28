import { z } from "zod";
import { commonSchema } from "../../common.schema.js";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { baseSchema } from "../../base.schema.js";
import { SessionBaseSchema, sessionBaseSchema } from "../auth/session.schema.js";
import { postBaseSchema, PostBaseSchema } from "../../../modules/post/schema.js";

extendZodWithOpenApi(z);

const { name, email, password } = commonSchema;

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

export const createUserSchema = z.strictObject({
  isEmailVerified: z.boolean().optional(),
  name,
  email,
  password,
  roleIds: z.uuid().array().optional(),
});
export const updateUserSchema = createUserSchema.partial();
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export const userResponseSchema = userBaseSchema;
export type UserResponse = z.infer<typeof userResponseSchema>;
