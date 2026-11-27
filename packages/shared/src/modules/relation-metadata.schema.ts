import { z } from "zod";

export const relationMetadataSchema = z.object({
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  deletedAt: z.iso.datetime().nullable().optional(),
  disabled: z.boolean().optional(),
});
