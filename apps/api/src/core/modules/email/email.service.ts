import type { EntityManager, Repository } from 'typeorm';
import { BaseService } from '../../base.service.js';
import { UserEntity } from '../user/entities/user.entity.js';
import { EmailStatus, type EmailEntity } from './entities/email.entity.js';
import { BASE_URL } from '../../constants.js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../../errors.js';
import type { AppConfig } from '../../types/app.types.js';
import {
  createTransport,
  type Mail,
  type SMTPSentMessageInfo,
  type SMTPTransportOptions,
} from 'nodemailer';

export type SendVerificationEmailParams = {
  userId: UserEntity['id'];
  userName: UserEntity['name'];
  userEmail: UserEntity['email'];
};

export interface EmailVerificationPayload extends JwtPayload {
  userId: string;
  email: string;
  purpose: 'email_verification';
}

export default class EmailService extends BaseService<
  EmailEntity,
  Repository<EmailEntity>
> {
  name = 'email';
  private readonly transporter: Mail<SMTPSentMessageInfo, SMTPTransportOptions>;

  constructor(
    protected readonly repository: Repository<EmailEntity>,
    protected readonly config: AppConfig
  ) {
    super(repository);

    this.transporter = createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure,
      tls: !this.config.smtp.secure
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      auth: {
        user: this.config.smtp.fromEmail,
        pass: this.config.smtp.password,
      },
    });
  }

  public async sendVerificationEmail(
    data: SendVerificationEmailParams,
    manager?: EntityManager
  ) {
    if (!this.config.smtp.host || !this.config.smtp.port) return;

    const repository = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    let email = repository.create({
      subject: 'Email Verification',
      from: this.config.smtp.fromEmail,
      to: `${data.userName} <${data.userEmail}>`,
      text: '',
    });

    email = await repository.save(email);
    email.text = `Hello ${data.userName},\n\nTo verify your account, please click on the following link: ${BASE_URL}/auth/verify/email/${this.generateEmailVerificationToken(data.userId, email.id, data.userEmail)}`;
    email = await repository.save(email);

    const result = await this.sendMail(
      email.to,
      email.subject,
      email.text,
      email.html ? email.html : undefined
    );

    email.resultJson = result ? result : null;

    if (result) {
      email.sentAt =
        result.accepted.length > 0 && result.response.includes('250')
          ? new Date()
          : null;
      email.status = EmailStatus.SENT;
    } else {
      email.failedAt = new Date();
      email.status = EmailStatus.FAILED;
    }

    return await repository.save(email);
  }

  public async verifyEmailVerificationToken(token: string) {
    try {
      if (!this.config.auth.emailVerificationSecret)
        throw new InternalServerError(
          'JWT_EMAIL_VERIFICATION_SECRET is not defined'
        );

      const decoded: string | JwtPayload = jwt.verify(
        token,
        this.config.auth.emailVerificationSecret
      );

      if (
        typeof decoded === 'string' ||
        decoded.purpose !== 'email_verification' ||
        typeof decoded.userId !== 'string' ||
        typeof decoded.emailId !== 'string' ||
        typeof decoded.email !== 'string'
      )
        throw new BadRequestError('Invalid email verification token');

      const email = await this.repository.findOne({
        where: {
          id: decoded.emailId,
        },
      });

      if (!email) throw new NotFoundError('Email not found');

      email.status = EmailStatus.READ;
      email.readAt = new Date();

      await this.repository.save(email);

      await this.repository.manager
        .getRepository(UserEntity)
        .update(decoded.userId, {
          isEmailVerified: true,
        });

      return {
        userId: decoded.userId,
        email: decoded.email,
        purpose:
          decoded.purpose as unknown as EmailVerificationPayload['purpose'],
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }

      console.error(error);

      throw new InternalServerError('Failed to verify email token');
    }
  }

  private generateEmailVerificationToken(
    userId: string,
    emailId: string,
    email: string,
    expiresIn: jwt.SignOptions['expiresIn'] = '1h'
  ): string {
    const payload: EmailVerificationPayload = {
      userId,
      emailId,
      email,
      purpose: 'email_verification',
    };

    if (!this.config.auth.emailVerificationSecret)
      throw new InternalServerError(
        'JWT_EMAIL_VERIFICATION_SECRET is not defined'
      );

    return jwt.sign(payload, this.config.auth.emailVerificationSecret, {
      expiresIn,
    });
  }

  private async sendMail(
    toEmail: string,
    subject: string,
    text: string,
    html?: string
  ) {
    if (!this.transporter.options.host || !this.transporter.options.port)
      return;

    const result = await this.transporter.sendMail({
      subject,
      from: this.config.smtp.fromEmail,
      to: toEmail,
      text,
      html,
    });

    return result;
  }
}
