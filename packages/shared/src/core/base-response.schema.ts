import { z } from "zod";

export const baseResponseSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  disabled: z.boolean(),
});
