import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../auth/authentication.module';
import { AuditStorageModule } from '../audit/audit-storage.module';
import { PermissionModule } from '../permission/permission.module';
import { ArticlesController } from './controllers/articles.controller';
import { Article } from './entities/article.entity';
import { ArticlesService } from './services/articles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    AuthenticationModule,
    AuditStorageModule,
    PermissionModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticleModule {}
