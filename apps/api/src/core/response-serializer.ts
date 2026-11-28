import type { z } from 'zod';
import { InternalServerError } from './errors.js';

export function toResponse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(normalizeDates(value));

  if (!result.success) {
    throw new InternalServerError(undefined, { cause: result.error });
  }

  return result.data;
}

function normalizeDates(
  value: unknown,
  seen = new WeakMap<object, unknown>()
): unknown {
  if (value instanceof Date) return value.toJSON();
  if (value === null || typeof value !== 'object') return value;

  if (seen.has(value)) return seen.get(value);

  if (Array.isArray(value)) {
    const result: unknown[] = [];
    seen.set(value, result);
    for (const item of value) result.push(normalizeDates(item, seen));
    return result;
  }

  const result: Record<string, unknown> = {};
  seen.set(value, result);
  for (const [key, item] of Object.entries(value)) {
    result[key] = normalizeDates(item, seen);
  }
  return result;
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
