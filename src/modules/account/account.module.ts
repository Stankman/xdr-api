import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Argon2ConfigModule } from '../../config/argon2/argon2-config.module';
import { HashService } from '../shared/services/hash.service';
import { AccountPlayer } from './entities/account-player.entity';
import { Account } from './entities/account.entity';
import { WebsiteAccountService } from './services/website-account.service';

@Module({
  imports: [
    Argon2ConfigModule,
    TypeOrmModule.forFeature([Account, AccountPlayer]),
  ],
  providers: [HashService, WebsiteAccountService],
  exports: [HashService, WebsiteAccountService],
})
export class AccountModule {}
