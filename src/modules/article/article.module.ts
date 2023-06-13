import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Argon2ConfigModule } from "src/config/argon2/argon2-config.module";
import { AccountModule } from "../account/account.module";
import { RoleModule } from "../role/role.module";
import { SharedModule } from "../shared/shared.module";
import { ArticlesController } from "./controllers/articles.controller";
import { Article } from "./entities/article.entity";
import { ArticlesRepository } from "./repositories/articles.repository";
import { ArticlesService } from "./services/articles.service";

@Module({
  imports: [
    AccountModule,
    Argon2ConfigModule,
    RoleModule,
    SharedModule,
    TypeOrmModule.forFeature([Article])
  ],
  controllers: [
    ArticlesController
  ],
  providers: [
    ArticlesService,
    ArticlesRepository
  ],
  exports: [
    ArticlesService,
    ArticlesRepository
  ]
})
export class ArticleModule {}
