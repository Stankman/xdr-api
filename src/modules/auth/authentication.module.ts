import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { TokenConfigService } from 'src/config/token/token-config.service';
import { UserModule } from '../user/user.module';
import { AuthenticationController } from './authentication.controller';
import { SignInService } from './services/signin.service';
import { BanModule } from '../ban/ban.module';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Module({
  imports: [
    UserModule,
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
    ResponseHelper
  ],
})
export class AuthenticationModule {}
