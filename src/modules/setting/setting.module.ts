import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../auth/authentication.module';
import { AuditStorageModule } from '../audit/audit-storage.module';
import { TurboModule } from '../turbo/turbo.module';
import { XdrSetting } from './entities/xdr-setting.entity';
import { WebsiteSettingsController } from './controllers/website-settings.controller';
import { WebsiteSettingsService } from './services/website-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([XdrSetting]),
    AuthenticationModule,
    AuditStorageModule,
    TurboModule,
  ],
  controllers: [WebsiteSettingsController],
  providers: [WebsiteSettingsService],
})
export class SettingModule {}
