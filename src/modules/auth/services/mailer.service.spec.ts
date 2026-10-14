import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

describe('MailerService configuration', () => {
  it('requires SMTP and a frontend URL before sending account email', () => {
    const config = {
      get: (_key: string, defaultValue: unknown) => defaultValue,
    } as unknown as ConfigService;
    const mailer = new MailerService(config);

    expect(() => mailer.assertConfigured()).toThrow(ServiceUnavailableException);
  });

  it('parses raw environment strings for SMTP port and secure mode', () => {
    const env: Record<string, string> = {
      SMTP_HOST: 'localhost',
      SMTP_PORT: '1025',
      SMTP_SECURE: 'false',
      SMTP_FROM: 'XDR <no-reply@xdr.local>',
      APP_PUBLIC_URL: 'http://localhost:5175',
    };
    const config = {
      get: (key: string, defaultValue: unknown) => env[key] ?? defaultValue,
    } as unknown as ConfigService;
    const options = (new MailerService(config) as any).transporter.options;

    expect(options.port).toBe(1025);
    expect(options.secure).toBe(false);

    env.SMTP_SECURE = 'true';
    expect((new MailerService(config) as any).transporter.options.secure).toBe(true);
  });
});
