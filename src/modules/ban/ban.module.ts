import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../shared/shared.module";
import { BanController } from "./controllers/ban.controller";
import { Ban } from "./entities/ban.entity";
import { BanRepository } from "./repositories/ban.repository";
import { BanService } from "./services/ban.service";

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Ban])
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
