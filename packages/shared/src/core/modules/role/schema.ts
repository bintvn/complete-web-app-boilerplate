import { z } from "zod";
import { commonSchema } from "../../common.schema.js";
import { baseSchema } from "../../base.schema.js";
import { userBaseSchema, UserBaseSchema } from "../user/user.schema.js";

const { name, slug, description } = commonSchema;
export const roleBaseSchema = baseSchema
  .extend({
    name,
    slug: slug.openapi({
      description: "The slug of the role",
      example: "admin",
    }),
    description: description.nullable(),
  })
  .openapi("RoleBase");

export type RoleBaseSchema = z.infer<typeof roleBaseSchema>;
export type RoleSchema = RoleBaseSchema & {
  users?: UserBaseSchema[];
};

export const roleSchema: z.ZodType<RoleSchema> = roleBaseSchema.extend({
  get users() {
    return userBaseSchema.array().optional();
  },
});

export const createRoleSchema = z.strictObject({
  name,
  slug,
  description: description.nullable().optional(),
});
export const updateRoleSchema = createRoleSchema.partial();
export type CreateRole = z.infer<typeof createRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;

export const roleResponseSchema = roleSchema;
export type RoleResponse = z.infer<typeof roleResponseSchema>;
