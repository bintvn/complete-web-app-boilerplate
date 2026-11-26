import type { NextFunction, Request, Response } from 'express';
import { AuthError } from '../errors.js';
import type { AccessTokenPayload } from '../types/auth.types.js';
import { verifyAccessToken } from '../utils/verify-access-token.util.js';
import type { AppConfig } from '../types/app.types.js';

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenPayload;
}

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;

export function requireAuth(req: AuthenticatedRequest): AccessTokenPayload {
  if (!req.auth) throw new AuthError('Unauthorized', 401, 'TOKEN_MISSING');

  return req.auth;
}

export default function createAuthMiddleware(appConfig: AppConfig) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(
        new AuthError(
          'Authorization Bearer header is required',
          401,
          'TOKEN_MISSING'
        )
      );
      return;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      next(new AuthError('Access token is empty', 401, 'TOKEN_MISSING'));

      return;
    }

    try {
      req.auth = verifyAccessToken(token, appConfig);

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}
