import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Argon2ConfigModule } from "src/config/argon2/argon2-config.module";
import { SharedModule } from "../shared/shared.module";
import { ArticlesController } from "./controllers/articles.controller";
import { Article } from "./entities/article.entity";
import { ArticlesRepository } from "./repositories/articles.repository";
import { ArticlesService } from "./services/articles.service";

@Module({
  imports: [
    Argon2ConfigModule,
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
