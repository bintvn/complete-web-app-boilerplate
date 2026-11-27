import { userResponseSchema } from '@complete-web-app-boilerplate/shared/core/modules/user';
import {
  serializeRelationDates,
  toResponse,
} from '../../response-serializer.js';
import type { UserEntity } from './entities/user.entity.js';

export function serializeUser(user: UserEntity) {
  return toResponse(userResponseSchema, serializeRelationDates(user));
}
