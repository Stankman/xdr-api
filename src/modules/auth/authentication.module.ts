import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { SignInService } from './services/signin.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule
  ],
  controllers: [
    AuthenticationController
  ],
  providers: [
    SignInService
  ],
})
export class AuthenticationModule {}
