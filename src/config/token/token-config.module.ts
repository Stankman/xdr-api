import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { TokenConfigService } from "./token-config.service";
import { TokenConfig } from "./token.config";

@Module({
  imports: [
    ConfigModule.forRoot({
        load: [TokenConfig],
        validationSchema: Joi.object({
            TOKEN_ISSUER: Joi.string().default('XDR-Issuer'),
            TOKEN_DURATION: Joi.string().default('1800s'),
            TOKEN_SECRET: Joi.string().default('$2x$07$xdrapipoweredbystankmanhash$')
        })
    })
  ],
  providers: [
      ConfigService,
      TokenConfigService
  ],
  exports: [
      ConfigService,
      TokenConfigService
  ]
})
export class TokenConfigModule {}
