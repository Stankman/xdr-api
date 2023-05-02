import { Module } from '@nestjs/common';
import { BanController } from './controllers/ban.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from './entities/ban.entity';
import { BanService } from './services/ban.service';
import { BanRepository } from './repositories/ban.repository';
import { AppConfigModule } from 'src/config/app/app-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ban]),
    AppConfigModule
  ],
  controllers: [
    BanController
  ],
  providers: [
    BanRepository,
    BanService
  ],
  exports: [
    BanService
  ]
})
export class BanModule {}
