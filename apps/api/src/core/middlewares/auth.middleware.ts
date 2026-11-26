import type { NextFunction, Request, Response } from 'express';
import { AuthError } from '../errors.js';
import type { AccessTokenPayload } from '../types/auth.types.js';
import { verifyAccessToken } from '../utils/verify-access-token.util.js';
import type { AppConfig } from '../types/app.types.js';

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenPayload;
}

export interface BearerAuthLocals {
  bearerCredentials?: 'missing' | 'malformed' | 'provided';
}

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;

export function requireAuth(req: AuthenticatedRequest): AccessTokenPayload {
  if (!req.auth) throw new AuthError('Unauthorized', 401, 'TOKEN_MISSING');

  return req.auth;
}

export default function createAuthMiddleware(appConfig: AppConfig) {
  return (
    req: AuthenticatedRequest,
    res: Response<unknown, BearerAuthLocals>,
    next: NextFunction
  ): void => {
    const [authorization, duplicateAuthorization] =
      req.headersDistinct.authorization ?? [];
    const [scheme, token, extra] = authorization?.trim().split(/\s+/, 3) ?? [];

    if (scheme?.toLowerCase() !== 'bearer') {
      res.locals.bearerCredentials = 'missing';
      next(
        new AuthError(
          'Authorization Bearer header is required',
          401,
          'TOKEN_MISSING'
        )
      );
      return;
    }

    if (
      !token ||
      extra ||
      token.includes(',') ||
      duplicateAuthorization !== undefined
    ) {
      res.locals.bearerCredentials = 'malformed';
      next(
        new AuthError(
          token
            ? 'Authorization Bearer header is malformed'
            : 'Access token is empty',
          400,
          token ? 'TOKEN_INVALID' : 'TOKEN_MISSING'
        )
      );

      return;
    }

    res.locals.bearerCredentials = 'provided';

    try {
      req.auth = verifyAccessToken(token, appConfig);

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}
