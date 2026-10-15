import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RateLimit } from '../../../common/decorators/rate-limit.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { AuthRateLimitGuard } from '../../../common/guards/auth-rate-limit.guard';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { EmailAddressDto } from '../dtos/email-address.dto';
import { LoginDto } from '../dtos/login.dto';
import { OneTimeTokenDto } from '../dtos/one-time-token.dto';
import { PasswordResetDto } from '../dtos/password-reset.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RegisterAccountDto } from '../dtos/register-account.dto';
import { AuthenticationService } from '../services/authentication.service';
import { CurrentAccountResponseDto } from '../../account/dtos/account-summary.dto';
import { PermissionService } from '../../permission/permission.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly permissions: PermissionService,
  ) {}

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60_000 })
  @ApiCreatedResponse({ description: 'An email verification link is sent.' })
  register(@Body() input: RegisterAccountDto, @Req() request: Request) {
    return this.authentication.register(input, this.metadata(request));
  }

  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 10, windowMs: 15 * 60_000 })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Website access and refresh tokens.' })
  login(@Body() input: LoginDto, @Req() request: Request) {
    return this.authentication.login(input, this.metadata(request));
  }

  @Post('refresh')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 20, windowMs: 15 * 60_000 })
  refresh(@Body() input: RefreshTokenDto, @Req() request: Request) {
    return this.authentication.refresh(
      input.refreshToken,
      this.metadata(request),
    );
  }

  @Post('email-verification/resend')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60_000 })
  resendVerification(@Body() input: EmailAddressDto) {
    return this.authentication.resendVerification(input.email);
  }

  @Post('email-verification/confirm')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 10, windowMs: 15 * 60_000 })
  verifyEmail(@Body() input: OneTimeTokenDto) {
    return this.authentication.verifyEmail(input.token);
  }

  @Post('password/recovery')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60_000 })
  requestPasswordRecovery(@Body() input: EmailAddressDto) {
    return this.authentication.requestPasswordRecovery(input.email);
  }

  @Post('password/reset')
  @UseGuards(AuthRateLimitGuard)
  @RateLimit({ limit: 5, windowMs: 15 * 60_000 })
  resetPassword(@Body() input: PasswordResetDto) {
    return this.authentication.resetPassword(input.token, input.newPassword);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOkResponse({ type: CurrentAccountResponseDto })
  @UseGuards(AuthGuard)
  async currentAccount(@Req() request: AuthenticatedRequest) {
    const [account, permissions] = await Promise.all([
      this.authentication.accountSummary(request.xdr_uid),
      this.permissions.grantedNodes(request.xdr_uid),
    ]);
    return { ...account, permissions };
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Req() request: AuthenticatedRequest) {
    return this.authentication.logout(request.xdr_session_id, request.xdr_uid);
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @UseGuards(AuthGuard)
  logoutAll(@Req() request: AuthenticatedRequest) {
    return this.authentication.logoutAll(request.xdr_uid);
  }

  private metadata(request: Request): {
    ipAddress: string | null;
    userAgent: string | null;
  } {
    const userAgent = request.headers['user-agent'];
    return {
      ipAddress: request.ip?.slice(0, 45) || null,
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 512) : null,
    };
  }
}
