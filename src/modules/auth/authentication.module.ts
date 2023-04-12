import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { TokenConfigService } from 'src/config/token/token-config.service';
import { BanModule } from '../ban/ban.module';
import { AccountModule } from '../account/account.module';
import { AuthenticationController } from './authentication.controller';
import { SignInService } from './services/signin.service';
import { SignUpService } from './services/signup.service';
import { TokenService } from './services/token.service';

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
    TokenConfigModule
  ],
  controllers: [
    AuthenticationController
  ],
  providers: [
    SignInService,
    SignUpService,
    TokenService
  ],
})
export class AuthenticationModule {}
