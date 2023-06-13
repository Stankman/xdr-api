import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { Article } from "../entities/article.entity";
import { ArticleSerializer } from "../serializers/article.serializer";
import { DataSource } from "typeorm";
import { plainToInstance, instanceToPlain } from "class-transformer";

@Injectable()
export class ArticlesRepository extends ModelRepository<Article, ArticleSerializer> {
    constructor(private dataSource : DataSource) {
        super(Article, dataSource.createEntityManager());
    }

    public async getArticle(value : any, column : string = 'id', relations : string[] = [], throwsException : boolean = true, transformOptions? : any) : Promise<ArticleSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }

    public transform(model: Article, transformOptions : any = {}): ArticleSerializer {
        return plainToInstance(ArticleSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Article[], transformOptions : any = {}): ArticleSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}