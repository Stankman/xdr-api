import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { AppConfigService } from './app-config.service';
import { Module } from '@nestjs/common';
import { AppConfig } from './app.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [AppConfig],
            validationSchema: Joi.object({
                APP_ENV: Joi.string().valid('development', 'production', 'test', 'provision').default('development'),
                APP_NAME: Joi.string().default('XDR API'),
                APP_URL: Joi.string().default('http://localhost'),
                APP_PORT: Joi.number().default(9000)
            })
        })
    ],
    providers: [
        ConfigService,
        AppConfigService
    ],
    exports: [
        ConfigService,
        AppConfigService
    ]
})
export class AppConfigModule {}
