import { z } from "zod";
import { moduleBaseSchema, ModuleBaseSchema } from "../module/schema.js";
import { baseSchema } from "../../base.schema.js";
import { roleBaseSchema, RoleBaseSchema } from "../role/schema.js";

const roleId = z.uuid();
const moduleId = z.uuid();
const canRead = z.boolean();
const canCreate = z.boolean();
const canUpdate = z.boolean();
const canDelete = z.boolean();

export const accessControlBaseSchema = baseSchema
  .extend({
    roleId,
    moduleId,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
  })
  .openapi("AccessControlBase");

export type AccessControlBaseSchema = z.infer<typeof accessControlBaseSchema>;
export type AccessControlSchema = AccessControlBaseSchema & {
  role: RoleBaseSchema;
  module: ModuleBaseSchema;
};
export const accessControlSchema = accessControlBaseSchema
  .omit({ moduleId: true, roleId: true })
  .extend({
    get role() {
      return roleBaseSchema;
    },
    get module() {
      return moduleBaseSchema;
    },
  })
  .openapi("AccessControl");
export const createAccessControlSchema = z.strictObject({
  roleId,
  moduleId,
  canRead,
  canCreate,
  canUpdate,
  canDelete,
});
export const updateAccessControlSchema = createAccessControlSchema.partial();
export type CreateAccessControl = z.infer<typeof createAccessControlSchema>;
export type UpdateAccessControl = z.infer<typeof updateAccessControlSchema>;

export const accessControlResponseSchema = baseSchema.extend({
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  role: roleBaseSchema.partial().required({ id: true }).nullable(),
  module: moduleBaseSchema.partial().required({ id: true }).nullable(),
});
export type AccessControlResponse = z.infer<typeof accessControlResponseSchema>;
