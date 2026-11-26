import { z } from 'zod';

const name = z
  .string()
  .min(1)
  .max(255)
  .refine((value) => value.trim().length > 0);
const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?![\s\S])/);

export const createCategorySchema = z.strictObject({
  name,
  slug,
});
export const updateCategorySchema = createCategorySchema.partial();
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
