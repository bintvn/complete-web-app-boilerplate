import { AuthError, TokenExpiredError } from '../errors.js';
import type { AppConfig } from '../types/app.types.js';
import type { AccessTokenPayload } from '../types/auth.types.js';
import jwt from 'jsonwebtoken';

export function verifyAccessToken(accessToken: string, appConfig: AppConfig) {
  try {
    const decoded = jwt.verify(accessToken, appConfig.auth.accessSecret, {
      issuer: appConfig.auth.issuer,
      audience: appConfig.auth.audience,
    });

    if (!isAccessTokenPayload(decoded))
      throw new AuthError('Invalid access token', 401, 'TOKEN_INVALID');

    return decoded;
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Access token expired', 'TOKEN_EXPIRED', {
        expiredAt: error.expiredAt,
      });
    }

    throw new AuthError('Invalid access token', 401, 'TOKEN_INVALID');
  }
}

export function isAccessTokenPayload(
  decoded: string | jwt.JwtPayload
): decoded is AccessTokenPayload {
  if (typeof decoded === 'string') {
    return false;
  }

  return (
    decoded['type'] === 'access' &&
    typeof decoded.sub === 'string' &&
    typeof decoded['sid'] === 'string' &&
    typeof decoded['email'] === 'string' &&
    Array.isArray(decoded['roles']) &&
    decoded['roles'].every((role): role is string => typeof role === 'string')
  );
}
