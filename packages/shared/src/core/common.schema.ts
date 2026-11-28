import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "zod";

extendZodWithOpenApi(z);

export const patchIdSchema = z.uuid();
const utf8Encoder = new TextEncoder();
const maxDescriptionBytes = 65_535;

export const commonSchema = {
  name: z
    .string()
    .min(1)
    .max(255)
    .refine((value) => value.trim().length > 0)
    .openapi({
      description: "Must contain a non-whitespace character.",
    }),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/),
  email: z.string().trim().toLowerCase().max(255).check(z.email()),
  description: z
    .string()
    .refine(
      (value) => utf8Encoder.encode(value).byteLength <= maxDescriptionBytes,
      {
        error: "Description must be at most 65,535 bytes in UTF-8",
      },
    ),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" })
    .max(255)
    .refine((value) => value.trim().length > 0, {
      error: "Password must contain a non-whitespace character",
    })
    .openapi({
      description: "User password (min 8 characters)",
      example: "SuperSecret123!",
      format: "password",
    }),
};
