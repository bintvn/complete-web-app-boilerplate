import type { JwtPayload } from 'jsonwebtoken';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  email: string;
  roles: string[];
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  jti: string;
  type: 'refresh';
}
