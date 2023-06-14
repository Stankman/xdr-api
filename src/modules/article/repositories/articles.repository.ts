import { Injectable } from "@nestjs/common";
import { ModelRepository } from "src/modules/shared/model.repository";
import { Article } from "../entities/article.entity";
import { ArticleSerializer } from "../serializers/article.serializer";
import { DataSource } from "typeorm";
import { plainToInstance, instanceToPlain, ClassTransformOptions } from "class-transformer";
import { defaultAvatarGroup } from "src/modules/avatar/serializers/avatar.serializer";

@Injectable()
export class ArticlesRepository extends ModelRepository<Article, ArticleSerializer> {
    constructor(private dataSource : DataSource) {
        super(Article, dataSource.createEntityManager());
    }

    public async getArticle(value : any, column : string = 'id', relations : string[] = ['author'], throwsException : boolean = true, transformOptions: ClassTransformOptions = { groups: [...defaultAvatarGroup] }) : Promise<ArticleSerializer> {
        return this.getOneBy({[column]: value}, relations, throwsException, transformOptions);
    }

    public transform(model: Article, transformOptions: ClassTransformOptions = { groups: [...defaultAvatarGroup] }): ArticleSerializer {
        return plainToInstance(ArticleSerializer, instanceToPlain(model, transformOptions), transformOptions);
    }

    public transformMany(models: Article[], transformOptions: ClassTransformOptions = { groups: [...defaultAvatarGroup] }): ArticleSerializer[] {
        return models.map(model => this.transform(model, transformOptions));
    }
}