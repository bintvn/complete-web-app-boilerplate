import type { Repository } from 'typeorm';
import { BaseService } from '../../base.service.js';
import type { AppConfig } from '../../types/app.types.js';
import {
  createTransport,
  type Mail,
  type SMTPSentMessageInfo,
  type SMTPTransportOptions,
} from 'nodemailer';
import { EmailStatus, type EmailEntity } from './entities/email.entity.js';

export type SendVerificationEmailParams = {
  email: string;
  code: string;
  expiresInMinutes: number;
};

export default class EmailService extends BaseService<EmailEntity> {
  readonly name = 'email';
  private readonly transporter: Mail<SMTPSentMessageInfo, SMTPTransportOptions>;

  constructor(
    repository: Repository<EmailEntity>,
    private readonly config: AppConfig
  ) {
    super(repository);

    const { host, port, secure, username, password } = this.config.smtp;
    this.transporter = createTransport({
      host,
      port,
      secure,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      ...(username && password
        ? { auth: { user: username, pass: password } }
        : {}),
    });
  }

  public async sendVerificationEmail({
    email,
    code,
    expiresInMinutes,
  }: SendVerificationEmailParams): Promise<boolean> {
    const { host, port, fromEmail, username, password } = this.config.smtp;
    if (
      !host ||
      !port ||
      !fromEmail ||
      Boolean(username) !== Boolean(password)
    ) {
      console.warn('Verification email SMTP configuration is incomplete');
      return false;
    }

    const subject = 'Email verification code';
    let sent = false;

    try {
      const result = await this.transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        text: `Your verification code is ${code}. It expires in ${String(expiresInMinutes)} minutes.`,
      });
      sent = result.accepted.length > 0;
    } catch {
      // SMTP errors may contain parts of the original message.
    }

    if (!sent) console.warn('Verification email SMTP delivery failed');

    try {
      const now = new Date();
      await this.create({
        from: fromEmail,
        to: email,
        subject,
        text: '',
        status: sent ? EmailStatus.SENT : EmailStatus.FAILED,
        sentAt: sent ? now : null,
        failedAt: sent ? null : now,
      });
    } catch {
      console.error('Could not record verification email delivery metadata');
    }

    return sent;
  }
}
