import { z } from 'zod';
import { baseSchema } from '../../core/base.schema.js';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const testBaseSchema = baseSchema
  .extend({
    id: z.uuid(),
    name: z.string(),
  })
  .openapi('TestBase');
export const createTestSchema = z.strictObject({
  name: z.string().trim().min(1).max(255),
});
export const updateTestSchema = createTestSchema.partial();
export type CreateTest = z.infer<typeof createTestSchema>;
export type UpdateTest = z.infer<typeof updateTestSchema>;
export type TestBase = z.infer<typeof testBaseSchema>;
