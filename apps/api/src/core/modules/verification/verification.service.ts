import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { EntityManager, Repository } from 'typeorm';
import { BaseService } from '../../base.service.js';
import type { UserEntity } from '../user/entities/user.entity.js';
import type { VerificationEntity } from './entities/verification.entity.js';

// const CODE_TTL_MINUTES = 10;
// const MAX_FAILED_ATTEMPTS = 5;
// const SEND_COOLDOWN_MS = 60_000;
// const SEND_WINDOW_MS = 3_600_000;
// const MAX_SENDS_PER_WINDOW = 5;

export type VerificationTarget = {
  userId: UserEntity['id'];
  purpose: string;
  destination: string;
};

export type VerificationServiceOptions = {
  otpSecret: string;
  codeTtlMinutes: number;
  maxFailedAttempts: number;
  sendCooldownMs: number;
  sendWindowMs: number;
  maxSendsPerWindow: number;
};

export default class VerificationService extends BaseService<VerificationEntity> {
  readonly name = 'verification';

  constructor(
    repository: Repository<VerificationEntity>,
    private readonly options: VerificationServiceOptions
  ) {
    super(repository);
  }

  // Callers hold a write lock on the user, or have created the user in this transaction.
  public async issue(target: VerificationTarget, manager: EntityManager) {
    const repository = manager.getRepository(this.repository.target);
    const previous = await this.findChallenge(target, manager);
    const now = Date.now();
    const issuedAtHistory = (previous?.issuedAtHistory ?? []).filter(
      (issuedAt) => issuedAt > now - this.options.sendWindowMs
    );

    if (
      issuedAtHistory.length >= this.options.maxSendsPerWindow ||
      issuedAtHistory.some(
        (issuedAt) => issuedAt > now - this.options.sendCooldownMs
      )
    ) {
      return null;
    }

    let code: string;
    let codeDigest: string;
    do {
      code = randomInt(0, 1_000_000).toString().padStart(6, '0');
      codeDigest = this.digest(target, code);
    } while (codeDigest === previous?.codeDigest);

    const challenge =
      previous ??
      repository.create({
        user: { id: target.userId },
        purpose: target.purpose,
      });
    challenge.destination = target.destination;
    challenge.codeDigest = codeDigest;
    challenge.expiresAt = new Date(now + this.options.codeTtlMinutes * 60_000);
    challenge.consumedAt = null;
    challenge.failedAttempts = 0;
    challenge.issuedAtHistory = [...issuedAtHistory, now];
    await repository.save(challenge);

    return { code, expiresInMinutes: this.options.codeTtlMinutes };
  }

  // Returning false lets the caller commit the failed attempt before sending an HTTP error.
  public async consume(
    target: VerificationTarget,
    code: string,
    manager: EntityManager
  ): Promise<boolean> {
    const repository = manager.getRepository(this.repository.target);
    const challenge = await this.findChallenge(target, manager);
    const now = new Date();

    if (
      !challenge ||
      challenge.destination !== target.destination ||
      challenge.consumedAt !== null ||
      challenge.expiresAt <= now ||
      challenge.failedAttempts >= this.options.maxFailedAttempts
    ) {
      return false;
    }

    const matches = timingSafeEqual(
      Buffer.from(challenge.codeDigest, 'hex'),
      Buffer.from(this.digest(target, code), 'hex')
    );

    if (matches) {
      challenge.consumedAt = now;
    } else {
      challenge.failedAttempts++;
    }

    await repository.save(challenge);
    return matches;
  }

  private findChallenge(target: VerificationTarget, manager: EntityManager) {
    return this.getBy(
      { user: { id: target.userId }, purpose: target.purpose },
      manager
    );
  }

  private digest(target: VerificationTarget, code: string): string {
    return createHmac('sha256', this.options.otpSecret)
      .update(
        JSON.stringify([
          target.userId,
          target.purpose,
          target.destination,
          code,
        ])
      )
      .digest('hex');
  }
}
