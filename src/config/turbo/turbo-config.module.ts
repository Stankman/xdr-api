import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TurboAdminClient } from '../../modules/turbo/turbo-admin.client';
import { TurboPermissionService } from '../../modules/turbo/turbo-permission.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        TURBO_ADMIN_BASE_URL: Joi.string().uri({ scheme: ['http', 'https'] }).allow('').default(''),
        TURBO_TIMEOUT_MS: Joi.number().integer().min(100).max(30000).default(5000),
      }),
    }),
  ],
  providers: [ConfigService, TurboAdminClient, TurboPermissionService],
  exports: [TurboAdminClient, TurboPermissionService],
})
export class TurboConfigModule {}
