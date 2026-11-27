import { z } from "zod";

export const createTestSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
});
export const updateTestSchema = createTestSchema.partial();
export const testResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
export type CreateTest = z.infer<typeof createTestSchema>;
export type UpdateTest = z.infer<typeof updateTestSchema>;
export type TestResponse = z.infer<typeof testResponseSchema>;
