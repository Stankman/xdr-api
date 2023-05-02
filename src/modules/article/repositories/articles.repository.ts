import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { Article } from "../entities/article.entity";
import { ArticleSerializer } from "../serializers/article.serializer";
import { DataSource } from "typeorm";

@Injectable()
export class ArticlesRepository extends ModelRepository<Article, ArticleSerializer> {
    constructor(private dataSource : DataSource) {
        super(Article, dataSource.createEntityManager());
    }
}