import { z } from "zod";

export const patchIdSchema = z.uuid();
const utf8Encoder = new TextEncoder();
const maxDescriptionBytes = 65_535;

export const descriptionSchema = z
  .string()
  .refine(
    (value) => utf8Encoder.encode(value).byteLength <= maxDescriptionBytes,
    {
      error: "Description must be at most 65,535 bytes in UTF-8",
    },
  )
  .optional();
