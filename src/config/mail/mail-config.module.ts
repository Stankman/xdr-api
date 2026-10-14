import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { MailerService } from '../../modules/auth/services/mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SMTP_HOST: Joi.string().allow('').default(''),
        SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
        SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
        SMTP_USER: Joi.string().allow('').default(''),
        SMTP_PASSWORD: Joi.string().allow('').default(''),
        SMTP_FROM: Joi.string().allow('').default(''),
        APP_PUBLIC_URL: Joi.string().uri().allow('').default(''),
      }),
    }),
  ],
  providers: [ConfigService, MailerService],
  exports: [MailerService],
})
export class MailConfigModule {}
