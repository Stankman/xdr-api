import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST', '');
    const user = config.get<string>('SMTP_USER', '');
    const password = config.get<string>('SMTP_PASSWORD', '');
    this.from = config.get<string>('SMTP_FROM', '');
    this.publicUrl = config.get<string>('APP_PUBLIC_URL', '').replace(/\/+$/, '');
    this.transporter = nodemailer.createTransport({
      host: host || 'localhost',
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get<boolean>('SMTP_SECURE', false),
      ...(user ? { auth: { user, pass: password } } : {}),
      logger: false,
      debug: false,
    });
    this.configured = Boolean(host && this.from && this.publicUrl && (!user || password));
  }

  private readonly configured: boolean;

  async sendVerification(email: string, token: string): Promise<void> {
    this.ensureConfigured();
    const link = this.link('/verify-email', token);
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Verify your XDR account',
      text: `Verify your email address using this one-time link: ${link}`,
    });
  }

  async sendPasswordRecovery(email: string, token: string): Promise<void> {
    this.ensureConfigured();
    const link = this.link('/reset-password', token);
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Reset your XDR password',
      text: `Use this one-time link to reset your password: ${link}`,
    });
  }

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new ServiceUnavailableException('Email delivery is not configured.');
    }
  }

  assertConfigured(): void {
    this.ensureConfigured();
  }

  private link(path: string, token: string): string {
    return `${this.publicUrl}${path}?token=${encodeURIComponent(token)}`;
  }
}
