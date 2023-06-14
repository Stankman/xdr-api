import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ArticlesRepository } from '../repositories/articles.repository';
import { FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Article } from '../entities/article.entity';
import { ArticleDTO } from '../dtos/article.dto';
import { Avatar } from 'src/modules/avatar/entities/avatar.entity';
import { ClassTransformOptions } from 'class-transformer';
import { defaultAvatarGroup } from 'src/modules/avatar/serializers/avatar.serializer';

@Injectable()
export class ArticlesService {
    constructor(
        private readonly repository : ArticlesRepository
    ) {}

    public async paginateArticles(options : IPaginationOptions, searchOptions?: FindManyOptions<Article>) {
        return this.repository.paginate(options, searchOptions);
    }

    public async getAvailableArticleById(id : number) : Promise<Article> {
        const whereOptions : FindOptionsWhere<Article> = {
            id: id,
            hidden: false
        };

        const transformOptions: ClassTransformOptions = {
            groups: [...defaultAvatarGroup]
        };

        return this.repository.getOneBy(whereOptions, ['author'], true, transformOptions);
    }

    public async getArticleById(id : number|string) : Promise<Article> {
        return this.repository.getArticle(id);
    }

    public async createArticle(articleDTO: ArticleDTO, avatar: Avatar) : Promise<Article> {
        const article : Article  = await this.getNewArticle(articleDTO, avatar);
        return this.repository.save(article);
    }

    public async editArticle(articleId: number, articleDTO: ArticleDTO) : Promise<Article> {
        const article : Article  = await this.getArticle(articleId, articleDTO);
        return this.repository.save(article);
    }

    private async getNewArticle(articleDTO: ArticleDTO, avatar: Avatar) : Promise<Article> {
        const article : Article = new Article();

        article.title = articleDTO.title;
        article.description = articleDTO.description;
        article.content = articleDTO.content;
        article.image = articleDTO.image;
        article.thumbnail = articleDTO.thumbnail;
        article.hidden = articleDTO.hidden;
        article.pinned = articleDTO.pinned;
        article.author = avatar;
        article.created_at = new Date();

        return article;
    }

    private async getArticle(articleId: number, articleDTO: ArticleDTO) : Promise<Article> {
        const article : Article = await this.repository.getArticle(articleId);

        article.title = articleDTO.title;
        article.description = articleDTO.description;
        article.content = articleDTO.content;
        article.image = articleDTO.image;
        article.thumbnail = articleDTO.thumbnail;
        article.hidden = articleDTO.hidden;
        article.pinned = articleDTO.pinned;

        return article;
    }
}
