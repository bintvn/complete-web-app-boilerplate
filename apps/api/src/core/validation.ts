import type { z } from 'zod';
import { patchIdSchema } from '@complete-web-app-boilerplate/shared/core/validation';
import {
  BadRequestError,
  ValidationError,
  type ErrorDetail,
} from './errors.js';

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const details = result.error.issues.flatMap<ErrorDetail>((issue) => {
    const path = issue.path.map(String).join('.');
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({
        field: path ? path + '.' + key : key,
        code: issue.code,
        message: 'Unrecognized field',
      }));
    }

    return [
      {
        ...(path && { field: path }),
        code: issue.code,
        message: issue.message,
      },
    ];
  });

  throw new ValidationError('Validation failed', details);
}

export function parsePatchId(value: string): string {
  if (!patchIdSchema.safeParse(value).success) {
    throw new BadRequestError('Invalid resource ID', [
      { field: 'id', code: 'invalid_format', message: 'Expected a UUID' },
    ]);
  }

  return value;
}
