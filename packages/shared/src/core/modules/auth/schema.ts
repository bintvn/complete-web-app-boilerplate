import { z } from "zod";
import { userResponseSchema } from "../user/schema.js";

const password = z.string().min(8).max(128);

export const registerSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email().max(255),
  password,
});

export const clientMetadataSchema = z.object({
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export const signInSchema = z.object({
  email: z.email(),
  password,
  metadata: clientMetadataSchema.optional(),
});

export const resendEmailVerificationSchema = z.object({
  email: z.string().trim().pipe(z.email().max(255)),
});

export const verifyEmailSchema = resendEmailVerificationSchema.extend({
  code: z
    .string()
    .length(6)
    .regex(/^[0-9]+$/),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: password,
  newPassword: password,
  revokeOtherSessions: z.boolean().optional(),
});

export const changeEmailSchema = z.object({
  newEmail: z.email(),
});

export const sessionInfoSchema = z.object({
  id: z.uuid(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime().nullable(),
  expiresAt: z.iso.datetime(),
  isCurrent: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResendEmailVerificationInput = z.infer<
  typeof resendEmailVerificationSchema
>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ClientMetadata = z.infer<typeof clientMetadataSchema>;
export type SessionInfo = z.infer<typeof sessionInfoSchema>;

export const authSuccessSchema = z.object({ success: z.literal(true) });
export const authMessageResponseSchema = authSuccessSchema.extend({
  message: z.string(),
});
export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal("Bearer"),
  accessTokenExpiresIn: z.number(),
  refreshTokenExpiresIn: z.number(),
});
export type AuthTokensSchema = z.infer<typeof authTokensSchema>;
export const authTokenResponseSchema = authSuccessSchema.extend({
  data: authTokensSchema,
});
export const authMeResponseSchema = authSuccessSchema.extend({
  data: userResponseSchema,
});

const sessionSchema = z.object({
  id: z.uuid(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime().nullable(),
  expiresAt: z.iso.datetime(),
  isCurrent: z.boolean(),
});
export const authSessionResponseSchema = authSuccessSchema.extend({
  data: sessionSchema,
});
export const authSessionsResponseSchema = authSuccessSchema.extend({
  data: z.array(sessionSchema),
});
