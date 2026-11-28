import { z } from "zod";

export type BaseSchema = z.infer<typeof baseSchema>;

export const baseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable().optional(),
  disabled: z.boolean(),
});
