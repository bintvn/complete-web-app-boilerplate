import type { Repository } from 'typeorm';
import { BaseService } from '../../base.service.js';
import type { AppConfig } from '../../types/app.types.js';
import {
  createTransport,
  type Mail,
  type SMTPSentMessageInfo,
  type SMTPTransportOptions,
} from 'nodemailer';
import { MailStatus, type MailEntity } from './entities/mail.entity.js';

export type SendVerificationMailParams = {
  email: string;
  code: string;
  expiresInMinutes: number;
};

export default class MailService extends BaseService<MailEntity> {
  readonly name = 'mail';
  private readonly transporter: Mail<SMTPSentMessageInfo, SMTPTransportOptions>;

  constructor(
    repository: Repository<MailEntity>,
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
      ...(!secure && { tls: { rejectUnauthorized: false } }),
      ...(username && password && { auth: { user: username, pass: password } }),
    });
  }

  public async sendVerificationMail({
    email,
    code,
    expiresInMinutes,
  }: SendVerificationMailParams): Promise<boolean> {
    const { host, port, fromEmail, username, password } = this.config.smtp;
    if (
      !host ||
      !port ||
      !fromEmail ||
      Boolean(username) !== Boolean(password)
    ) {
      console.warn('Verification mail SMTP configuration is incomplete');
      return false;
    }

    const subject = 'Mail verification code';
    let sent = false;

    const text = `Your verification code is ${code}. It expires in ${String(expiresInMinutes)} minutes.`;

    try {
      const result = await this.transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        text,
      });
      sent = result.accepted.length > 0;
    } catch {
      // SMTP errors may contain parts of the original message.
    }

    if (!sent) console.warn('Verification mail SMTP delivery failed');

    try {
      const now = new Date();
      await this.create({
        from: fromEmail,
        to: email,
        subject,
        text,
        status: sent ? MailStatus.SENT : MailStatus.FAILED,
        sentAt: sent ? now : null,
        failedAt: sent ? null : now,
      });
    } catch {
      console.error('Could not record verification mail delivery metadata');
    }

    return sent;
  }
}
