import z from "zod";
import { baseSchema } from "../../base.schema.js";
import { userSchema, UserSchema } from "../user/user.schema.js";

export const sessionBaseSchema = baseSchema
  .extend({
    expiresAt: z.iso.datetime(),
    lastUsedAt: z.iso.datetime().nullable(),
    revokedAt: z.iso.datetime().nullable(),
    refreshTokenHash: z.string().max(64),
    userAgent: z.string().max(512).nullable(),
    ipAddress: z.string().max(45).nullable(),
  })
  .openapi("SessionBase");

export type SessionBaseSchema = z.infer<typeof sessionBaseSchema>;
export type SessionSchema = SessionBaseSchema & {
  user?: UserSchema;
};

export const sessionSchema: z.ZodType<SessionSchema> = sessionBaseSchema
  .extend({
    get user() {
      return userSchema.optional();
    },
  })
  .openapi("Session");
