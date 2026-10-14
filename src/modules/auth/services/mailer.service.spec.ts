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
});
