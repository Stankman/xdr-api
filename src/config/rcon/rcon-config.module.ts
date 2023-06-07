import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { RconConfigService } from './rcon-config.service';
import { RconConfig } from './rcon.config';

@Module({
  imports: [
    ConfigModule.forRoot({
        load: [RconConfig],
        validationSchema: Joi.object({
            RCON_HOST: Joi.string().default('localhost'),
            RCON_PORT: Joi.number().default(3001)
        })
    })
],
providers: [
    ConfigService,
    RconConfigService
],
exports: [
    ConfigService,
    RconConfigService
]
})
export class RconConfigModule {}