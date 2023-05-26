import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TokenConfigModule } from "src/config/token/token-config.module";
import { TokenConfigService } from "src/config/token/token-config.service";

import { AccountModule } from "../account/account.module";
import { BanModule } from "../ban/ban.module";

import { AuthenticationController } from "./controllers/authentication.controller";

import { HashService } from "../shared/services/hash.service";
import { SignInService } from "./services/signin.service";
import { SignUpService } from "./services/signup.service";
import { TokenService } from "./services/token.service";
import { Argon2ConfigModule } from '../../config/argon2/argon2-config.module';

@Module({
  imports: [
    AccountModule,
    BanModule,
    JwtModule.registerAsync({
      imports: [TokenConfigModule],
      useFactory: (tokenConfig : TokenConfigService) => ({
        secret: tokenConfig.secret,
        signOptions: {
          expiresIn: tokenConfig.duration
        }
      }),
      inject: [TokenConfigService]
    }),
    TokenConfigModule,
    Argon2ConfigModule
  ],
  controllers: [
    AuthenticationController
  ],
  providers: [
    HashService,
    SignInService,
    SignUpService,
    TokenService
  ],
})
export class AuthenticationModule {}
