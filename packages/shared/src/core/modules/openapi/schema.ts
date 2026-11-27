import { z } from "zod";

export const apiErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;

export const requestValidationErrorSchema = z.object({
  success: z.literal(false),
  code: z.literal("VALIDATION_ERROR"),
  errors: z.array(
    z.looseObject({
      code: z.string(),
      message: z.string(),
      path: z.array(z.union([z.string(), z.number()])),
    }),
  ),
});

export const openApiDocumentSchema = z.looseObject({
  openapi: z.string(),
  info: z.looseObject({ title: z.string(), version: z.string() }),
  paths: z.record(z.string(), z.unknown()),
});

export type OpenApiDocument = z.infer<typeof openApiDocumentSchema>;
