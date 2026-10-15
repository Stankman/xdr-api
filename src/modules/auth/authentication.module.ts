import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenConfigModule } from '../../config/token/token-config.module';
import { TokenConfigService } from '../../config/token/token-config.service';
import { MailConfigModule } from '../../config/mail/mail-config.module';
import { AccountModule } from '../account/account.module';
import { AccountSession } from './entities/account-session.entity';
import { AccountToken } from './entities/account-token.entity';
import { AccountSessionsController } from './controllers/account-sessions.controller';
import { AuthenticationController } from './controllers/authentication.controller';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthRateLimitGuard } from '../../common/guards/auth-rate-limit.guard';
import { AuthenticationService } from './services/authentication.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    AccountModule,
    forwardRef(() => PermissionModule),
    MailConfigModule,
    TokenConfigModule,
    TypeOrmModule.forFeature([AccountSession, AccountToken]),
    JwtModule.registerAsync({
      imports: [TokenConfigModule],
      useFactory: (tokenConfig: TokenConfigService) => ({
        secret: tokenConfig.secret,
        signOptions: {
          expiresIn: tokenConfig.duration,
          issuer: tokenConfig.issuer,
        },
      }),
      inject: [TokenConfigService],
    }),
  ],
  controllers: [AuthenticationController, AccountSessionsController],
  providers: [
    AuthGuard,
    AuthRateLimitGuard,
    AuthenticationService,
    SessionService,
    TokenService,
  ],
  exports: [
    AuthGuard,
    AuthenticationService,
    SessionService,
    TokenService,
    JwtModule,
    TokenConfigModule,
  ],
})
export class AuthenticationModule {}
