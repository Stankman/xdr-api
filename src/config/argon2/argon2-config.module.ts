import { ConfigModule, ConfigService } from '@nestjs/config';
import { Argon2ConfigService } from './argon2-config.service';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { Argon2Config } from './argon2-config';

@Module({
  imports: [
    ConfigModule.forRoot({
        load: [Argon2Config],
        validationSchema: Joi.object({
            ARGON2_MEMORY_COST: Joi.number().default(65536),
            ARGON2_TIME_COST: Joi.number().default(3),
            ARGON2_THREADS: Joi.number().default(4)
        })
    })
  ],
  providers: [
      ConfigService,
      Argon2ConfigService
  ],
  exports: [
      ConfigService,
      Argon2ConfigService
  ]
})
export class Argon2ConfigModule {}
