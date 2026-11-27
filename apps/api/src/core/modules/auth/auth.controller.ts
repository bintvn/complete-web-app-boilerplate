import type { Request, Response } from 'express';
import type { AuthService } from './auth.service.js';
import {
  requireAuth,
  type AuthenticatedRequest,
} from '../../middlewares/auth.middleware.js';
import type { SessionEntity } from '../session/entities/session.entity.js';
import { AuthError } from '../../errors.js';
import { serializeDate, toResponse } from '../../response-serializer.js';
import type { SessionInfo, ClientMetadata } from '../../types/auth.types.js';
import {
  authMeResponseSchema,
  authMessageResponseSchema,
  authSessionResponseSchema,
  authSessionsResponseSchema,
  authSuccessSchema,
  authTokenResponseSchema,
  changePasswordSchema,
  refreshSchema,
  registerSchema,
  resendEmailVerificationSchema,
  signInSchema,
  verifyEmailSchema,
} from '@complete-web-app-boilerplate/shared/core/modules/auth';
import { IS_DEV } from '../../constants.js';
import { serializeUser } from '../user/user.serializer.js';
import type { AppConfig } from '../../types/app.types.js';

function serializeSession(session: SessionInfo) {
  return {
    ...session,
    createdAt: serializeDate(session.createdAt),
    lastUsedAt: serializeDate(session.lastUsedAt),
    expiresAt: serializeDate(session.expiresAt),
  };
}

export class AuthController {
  private readonly authService: AuthService;

  constructor(
    protected readonly config: AppConfig,
    authService: AuthService
  ) {
    this.authService = authService;
  }

  public signUp = async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.parse(req.body);
    await this.authService.register(parsed);

    res.status(201).json(toResponse(authSuccessSchema, { success: true }));
  };

  public signin = async (req: Request, res: Response): Promise<void> => {
    const parsed = signInSchema.parse(req.body);
    const result = await this.authService.signin({
      ...parsed,
      metadata: this.extractMetadata(req),
    });

    const response = toResponse(authTokenResponseSchema, {
      success: true,
      data: result,
    });
    this.setCookie(res, response.data.refreshToken);
    res.status(200).json(response);
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const parsed = !req.body ? undefined : refreshSchema.parse(req.body);
    const cookies = req.signedCookies as Record<string, unknown> | undefined;
    const cookieToken = cookies?.[this.authService.config.cookie.name];
    const refreshToken =
      parsed?.refreshToken ||
      (typeof cookieToken === 'string' ? cookieToken : null);

    if (!refreshToken)
      throw new AuthError('Refresh token not found', 401, 'TOKEN_MISSING');

    const result = await this.authService.refresh(
      refreshToken,
      this.extractMetadata(req)
    );

    const response = toResponse(authTokenResponseSchema, {
      success: true,
      data: result,
    });
    this.setCookie(res, response.data.refreshToken);
    res.status(200).json(response);
  };

  public me = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    const data = await this.authService.me(auth.sub);

    res.status(200).json(
      toResponse(authMeResponseSchema, {
        success: true,
        data: serializeUser(data),
      })
    );
  };

  public session = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    const data = await this.authService.getSession(auth.sub, auth.sid);

    res.status(200).json(
      toResponse(authSessionResponseSchema, {
        success: true,
        data: serializeSession(data),
      })
    );
  };

  public sessions = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    const data = await this.authService.getActiveSessions(auth.sub, auth.sid);

    res.status(200).json(
      toResponse(authSessionsResponseSchema, {
        success: true,
        data: data.map(serializeSession),
      })
    );
  };

  public signout = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    await this.authService.signout(auth.sid, auth.sub);

    this.clearCookie(res);

    res.status(200).json(toResponse(authSuccessSchema, { success: true }));
  };

  public signoutAll = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    await this.authService.signoutAll(auth.sub);

    this.clearCookie(res);

    res.status(200).json(toResponse(authSuccessSchema, { success: true }));
  };

  public revokeSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    const targetSessionId = req.params['sessionId'];

    if (!targetSessionId) {
      throw new AuthError(
        'Parameter sessionId wajib diisi',
        400,
        'SESSION_NOT_FOUND'
      );
    }

    await this.authService.revokeSession(
      auth.sub,
      targetSessionId as unknown as SessionEntity['id']
    );

    res.status(200).json(
      toResponse(authMessageResponseSchema, {
        success: true,
        message: 'Sesi berhasil dicabut',
      })
    );
  };

  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    const auth = requireAuth(req);
    const parsed = changePasswordSchema.parse(req.body);

    await this.authService.changePassword({
      userId: auth.sub,
      currentSessionId: auth.sid,
      oldPassword: parsed.oldPassword,
      newPassword: parsed.newPassword,
      ...(parsed.revokeOtherSessions !== undefined
        ? { revokeOtherSessions: parsed.revokeOtherSessions }
        : {}),
    });

    res.status(200).json(
      toResponse(authMessageResponseSchema, {
        success: true,
        message: 'Password berhasil diperbarui',
      })
    );
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = verifyEmailSchema.parse(req.body);
    await this.authService.verifyEmail(email, code);

    res.status(200).json(toResponse(authSuccessSchema, { success: true }));
  };

  public resendEmailVerification = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = resendEmailVerificationSchema.parse(req.body);
    await this.authService.resendEmailVerification(email);

    res.status(202).json(toResponse(authSuccessSchema, { success: true }));
  };

  private extractMetadata(req: Request): ClientMetadata {
    const forwardedFor = req.headers['x-forwarded-for'];
    const rawIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim();

    return {
      ipAddress: rawIp ?? req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    };
  }

  private setCookie(res: Response, token: string): void {
    if (this.config.cookie.expiresInSeconds && this.config.cookie.secret)
      res.cookie(this.authService.config.cookie.name, token, {
        signed: true,
        httpOnly: true,
        secure: !IS_DEV,
        sameSite: 'strict',
        maxAge: this.config.cookie.expiresInSeconds * 1000,
      });
  }

  private clearCookie(res: Response): void {
    if (this.config.cookie.expiresInSeconds && this.config.cookie.secret)
      res.clearCookie(this.authService.config.cookie.name, {
        signed: true,
        httpOnly: true,
        secure: !IS_DEV,
        sameSite: 'strict',
      });
  }
}
