import { createHash, randomUUID } from 'node:crypto';
import {
  hash as hashPassword,
  verify as verifyPassword,
} from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { IsNull, Not, type EntityManager } from 'typeorm';
import { AuthError, NotFoundError, TokenExpiredError } from '../../errors.js';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
  AuthResult,
  ChangePasswordInput,
  ClientMetadata,
  RefreshTokenPayload,
  RegisterInput,
  SessionInfo,
  SignInInput,
  TokenPair,
} from '../../types/auth.types.js';
import type UserService from '../user/user.service.js';
import type RoleService from '../role/role.service.js';
import type { RoleEntity } from '../role/entities/role.entity.js';
import type EmailService from '../email/email.service.js';
import type { AuthModuleDependencies } from './index.js';
import type { UserEntity } from '../user/entities/user.entity.js';
import type { SessionEntity } from '../session/entities/session.entity.js';
import type SessionService from '../session/session.service.js';
import type VerificationService from '../verification/verification.service.js';
import { CoreBaseService } from '../../core-base.service.js';
import type { AppConfig } from '../../types/app.types.js';

const EMAIL_VERIFICATION_PURPOSE = 'verify_email';

export class AuthService extends CoreBaseService {
  public readonly name = 'auth';
  private readonly emailService: EmailService;
  private readonly sessionService: SessionService;
  private readonly userService: UserService;
  private readonly roleService: RoleService;
  private readonly verificationService: VerificationService;

  constructor(
    protected readonly dependencies: AuthModuleDependencies,
    protected readonly config: AppConfig
  ) {
    super();

    this.emailService = dependencies.emailService;
    this.sessionService = dependencies.sessionService;
    this.userService = dependencies.userService;
    this.roleService = dependencies.roleService;
    this.verificationService = dependencies.verificationService;
    this.config = config;
  }

  public async register(input: RegisterInput): Promise<void> {
    const normalizedEmail = this.normalizeEmail(input.email);

    await this.userService.repository.manager.transaction(async (manager) => {
      const userRepository = manager.getRepository(
        this.userService.repository.target
      );
      const existingUser = await userRepository.findOne({
        select: {
          id: true,
        },
        where: {
          email: normalizedEmail,
        },
      });

      if (existingUser)
        throw new AuthError('Email Exists', 409, 'EMAIL_ALREADY_EXISTS');

      const role = await this.roleService.getBy({ slug: 'user' }, manager);

      if (!role) throw new NotFoundError('User Role not found');

      await this.userService.create(
        {
          name: input.name.trim(),
          email: normalizedEmail,
          password: input.password,
          roleId: role.id,
        },
        manager
      );
    });
  }

  public async signin(input: SignInInput): Promise<AuthResult> {
    const normalizedEmail = this.normalizeEmail(input.email);

    const user = await this.userService.repository.findOne({
      where: {
        email: normalizedEmail,
      },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user)
      throw new AuthError(
        'Wrong email or password',
        401,
        'INVALID_CREDENTIALS'
      );

    const isPasswordValid = await verifyPassword(
      user.passwordHash,
      input.password
    );

    if (!isPasswordValid) {
      throw new AuthError(
        'Wrong email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    if (!user.isEmailVerified)
      throw new AuthError('Email is not verified', 400, 'EMAIL_NOT_VERIFIED');

    const authUser: AuthenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: this.extractRoles(user),
    };

    return this.createSessionAndTokens(authUser, input.metadata);
  }

  public async refresh(
    refreshToken: string,
    metadata?: ClientMetadata
  ): Promise<AuthResult> {
    const payload = this.verifyRefreshToken(refreshToken);

    const session = await this.sessionService.repository.findOne({
      where: { id: payload.sid, user: { id: payload.sub } },
    });

    if (!session)
      throw new AuthError('Session not found', 401, 'SESSION_NOT_FOUND');

    const incomingHash = this.hashToken(refreshToken);

    if (
      session.revokedAt !== null ||
      session.refreshTokenHash !== incomingHash
    ) {
      await this.signoutAll(payload.sub);

      throw new AuthError(
        'Token reuse detected. Please sign in again.',
        401,
        'TOKEN_REUSE_DETECTED'
      );
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      session.revokedAt = new Date();
      await this.sessionService.repository.save(session);

      throw new AuthError(
        'Refresh token telah kedaluwarsa',
        401,
        'TOKEN_EXPIRED'
      );
    }

    const user = await this.userService.repository.findOne({
      where: { id: payload.sub },
      relations: { userRoles: true },
    });

    if (!user) throw new AuthError('User not found', 401, 'USER_NOT_FOUND');

    const authUser: AuthenticatedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: this.extractRoles(user),
    };

    const tokens = this.generateTokenPair(authUser, session.id);
    const now = new Date();

    session.refreshTokenHash = this.hashToken(tokens.refreshToken);
    session.expiresAt = new Date(
      now.getTime() + this.config.auth.refreshExpiresInSeconds * 1000
    );
    session.lastUsedAt = now;

    if (metadata?.ipAddress !== undefined) {
      session.ipAddress = metadata.ipAddress;
    }
    if (metadata?.userAgent !== undefined) {
      session.userAgent = metadata.userAgent;
    }

    await this.sessionService.repository.save(session);

    return tokens;
  }

  public verifyAccessToken(accessToken: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(accessToken, this.config.auth.accessSecret, {
        issuer: this.config.auth.issuer,
        audience: this.config.auth.audience,
      });

      if (!this.isAccessTokenPayload(decoded))
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

  public async me(userId: UserEntity['id']) {
    const user = await this.userService.repository.findOne({
      where: { id: userId },
      relations: { userRoles: { role: true } },
    });

    if (!user) throw new AuthError('User not found', 401, 'USER_NOT_FOUND');

    return user;
  }

  public async getSession(
    userId: UserEntity['id'],
    sessionId: SessionEntity['id']
  ): Promise<SessionInfo> {
    const [user, session] = await Promise.all([
      this.userService.repository.findOne({
        where: { id: userId },
        relations: { userRoles: { role: true } },
      }),
      this.sessionService.repository.findOne({
        where: { id: sessionId, user: { id: userId } },
      }),
    ]);

    if (!user) throw new AuthError('User not found', 401, 'USER_NOT_FOUND');

    if (!session)
      throw new AuthError('Session not found', 401, 'SESSION_NOT_FOUND');

    if (
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new AuthError(
        'Session has been ended or revoked',
        401,
        'SESSION_REVOKED'
      );
    }

    return this.toSessionInfo(session, session.id);
  }

  public async getActiveSessions(
    userId: UserEntity['id'],
    currentSessionId?: SessionEntity['id']
  ): Promise<SessionInfo[]> {
    const sessions = await this.sessionService.repository.find({
      where: {
        user: {
          id: userId,
        },
        revokedAt: IsNull(),
      },
      order: {
        lastUsedAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    if (
      currentSessionId &&
      !sessions.find((session) => session.id === currentSessionId)
    )
      throw new AuthError(
        'Session has been ended or revoked',
        401,
        'SESSION_REVOKED'
      );

    return sessions
      .filter((session) => session.expiresAt.getTime() > Date.now())
      .map((session) => this.toSessionInfo(session, currentSessionId));
  }

  public async signout(
    sessionId: SessionEntity['id'],
    userId?: UserEntity['id']
  ): Promise<void> {
    const session = await this.sessionService.repository.findOne({
      where: {
        id: sessionId,
        user: { id: userId },
      },
    });

    if (!session)
      throw new AuthError('Session not found', 401, 'SESSION_NOT_FOUND');

    if (session.revokedAt)
      throw new AuthError(
        'Session has been ended or revoked',
        401,
        'SESSION_REVOKED'
      );

    const whereClause =
      userId !== undefined
        ? { id: sessionId, user: { id: userId }, revokedAt: IsNull() }
        : { id: sessionId, revokedAt: IsNull() };

    await this.sessionService.repository.update(whereClause, {
      revokedAt: new Date(),
    });
  }

  public async signoutByRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    await this.sessionService.repository.update(
      { refreshTokenHash: tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  public async revokeSession(
    userId: UserEntity['id'],
    targetSessionId: SessionEntity['id']
  ): Promise<void> {
    const result = await this.sessionService.repository.update(
      { id: targetSessionId, user: { id: userId }, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );

    if (!result.affected)
      throw new AuthError(
        'Sesi tidak ditemukan atau sudah dicabut',
        404,
        'SESSION_NOT_FOUND'
      );
  }

  public async signoutAll(
    userId: UserEntity['id'],
    exceptSessionId?: SessionEntity['id']
  ): Promise<void> {
    const whereClause =
      exceptSessionId !== undefined
        ? {
            user: { id: userId },
            id: Not(exceptSessionId),
            revokedAt: IsNull(),
          }
        : { user: { id: userId }, revokedAt: IsNull() };

    await this.sessionService.repository.update(whereClause, {
      revokedAt: new Date(),
    });
  }

  public async changePassword(input: ChangePasswordInput): Promise<void> {
    const user = await this.userService.repository.findOne({
      where: { id: input.userId },
    });

    if (!user) throw new AuthError('User not found', 404, 'USER_NOT_FOUND');

    const isOldPasswordValid = await verifyPassword(
      user.passwordHash,
      input.oldPassword
    );

    if (!isOldPasswordValid)
      throw new AuthError('Invalid old password', 403, 'INVALID_CREDENTIALS');

    user.passwordHash = await hashPassword(input.newPassword);
    await this.userService.repository.save(user);

    if (input.revokeOtherSessions !== false)
      await this.signoutAll(input.userId, input.currentSessionId);
  }

  public async verifyEmail(email: string, code: string): Promise<void> {
    const verified = await this.userService.repository.manager.transaction(
      async (manager) => {
        const user = await this.findPendingVerificationUser(email, manager);
        if (!user) return false;

        const consumed = await this.verificationService.consume(
          this.emailVerificationTarget(user),
          code,
          manager
        );
        if (!consumed) return false;

        await manager
          .getRepository(this.userService.repository.target)
          .update(user.id, {
            isEmailVerified: true,
          });
        return true;
      }
    );

    if (!verified) {
      throw new AuthError(
        'Invalid or expired email verification code',
        400,
        'EMAIL_VERIFICATION_INVALID'
      );
    }
  }

  public async resendEmailVerification(email: string): Promise<void> {
    const delivery = await this.userService.repository.manager.transaction(
      async (manager) => {
        const user = await this.findPendingVerificationUser(email, manager);
        if (!user) return null;

        const target = this.emailVerificationTarget(user);
        const challenge = await this.verificationService.issue(target, manager);
        return challenge ? { email: target.destination, ...challenge } : null;
      }
    );

    if (delivery) await this.emailService.sendVerificationEmail(delivery);
  }

  private findPendingVerificationUser(email: string, manager: EntityManager) {
    return manager.getRepository(this.userService.repository.target).findOne({
      where: {
        email: this.normalizeEmail(email),
        isEmailVerified: false,
        disabled: false,
        deletedAt: IsNull(),
      },
      lock: { mode: 'pessimistic_write' },
    });
  }

  private emailVerificationTarget(user: UserEntity) {
    return {
      userId: user.id,
      purpose: EMAIL_VERIFICATION_PURPOSE,
      destination: this.normalizeEmail(user.email),
    };
  }

  private async createSessionAndTokens(
    user: AuthenticatedUser,
    metadata?: ClientMetadata
  ): Promise<AuthResult> {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.config.auth.refreshExpiresInSeconds * 1000
    );

    const userData = await this.userService.repository.findOneBy({
      id: user.id,
    });

    if (!userData) throw new AuthError('User not found', 404, 'USER_NOT_FOUND');

    const session = this.sessionService.repository.create({
      user: userData,
      refreshTokenHash: this.hashToken(randomUUID()),
      userAgent: metadata?.userAgent ?? null,
      ipAddress: metadata?.ipAddress ?? null,
      expiresAt,
      lastUsedAt: now,
      revokedAt: null,
    });

    const savedSession = await this.sessionService.repository.save(session);
    const tokens = this.generateTokenPair(user, savedSession.id);

    savedSession.refreshTokenHash = this.hashToken(tokens.refreshToken);
    await this.sessionService.repository.save(savedSession);

    return tokens;
  }

  private generateTokenPair(
    user: AuthenticatedUser,
    sessionId: SessionEntity['id']
  ): TokenPair {
    const subject = user.id;
    const sid = sessionId;

    const accessPayload: AccessTokenPayload = {
      sub: subject,
      sid,
      email: user.email,
      roles: user.roles,
      type: 'access',
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: subject,
      sid,
      jti: randomUUID(),
      type: 'refresh',
    };

    const accessOptions: SignOptions = {
      expiresIn: this.config.auth.accessExpiresInSeconds,
      issuer: this.config.auth.issuer,
      audience: this.config.auth.audience,
    };

    const refreshOptions: SignOptions = {
      expiresIn: this.config.auth.refreshExpiresInSeconds,
      issuer: this.config.auth.issuer,
      audience: this.config.auth.audience,
    };

    const accessToken = jwt.sign(
      accessPayload,
      this.config.auth.accessSecret,
      accessOptions
    );
    const refreshToken = jwt.sign(
      refreshPayload,
      this.config.auth.refreshSecret,
      refreshOptions
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      accessTokenExpiresIn: this.config.auth.accessExpiresInSeconds,
      refreshTokenExpiresIn: this.config.auth.refreshExpiresInSeconds,
    };
  }

  private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(refreshToken, this.config.auth.refreshSecret, {
        issuer: this.config.auth.issuer,
        audience: this.config.auth.audience,
      });

      if (!this.isRefreshTokenPayload(decoded)) {
        throw new AuthError(
          'Refresh token payload is not valid',
          401,
          'TOKEN_INVALID'
        );
      }

      return decoded;
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError(
          'Refresh token telah kedaluwarsa',
          401,
          'TOKEN_EXPIRED'
        );
      }

      throw new AuthError('Refresh token tidak valid', 401, 'TOKEN_INVALID');
    }
  }

  private isAccessTokenPayload(
    decoded: string | JwtPayload
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

  private isRefreshTokenPayload(
    decoded: string | JwtPayload
  ): decoded is RefreshTokenPayload {
    if (typeof decoded === 'string') {
      return false;
    }

    return (
      decoded['type'] === 'refresh' &&
      typeof decoded.sub === 'string' &&
      typeof decoded['sid'] === 'string' &&
      typeof decoded.jti === 'string'
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private extractRoles(user: UserEntity): RoleEntity['slug'][] {
    if (!user.userRoles) return [];

    return user.userRoles
      .map((item) => {
        return item.role?.slug;
      })
      .filter((role): role is string => role !== undefined);
  }

  private toSessionInfo(
    session: SessionEntity,
    currentSessionId?: SessionEntity['id']
  ): SessionInfo {
    return {
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      isCurrent:
        currentSessionId !== undefined && session.id === currentSessionId,
    };
  }
}
