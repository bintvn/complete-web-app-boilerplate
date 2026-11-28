import type { z } from 'zod';
import { InternalServerError } from './errors.js';

export function toResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new InternalServerError(undefined, { cause: result.error });
  }
  return result.data;
}

export function serializeDate(value: Date | null | undefined) {
  return value?.toJSON() ?? value;
}

export function serializeRelationDates<
  T extends {
    createdAt?: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
  },
>(entity: T) {
  return {
    ...entity,
    createdAt: serializeDate(entity.createdAt),
    updatedAt: serializeDate(entity.updatedAt),
    deletedAt: serializeDate(entity.deletedAt),
  };
}
