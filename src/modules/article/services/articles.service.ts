import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ArticlesRepository } from '../repositories/articles.repository';
import { FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Article } from '../entities/article.entity';
import { ArticleDTO } from '../dtos/article.dto';

@Injectable()
export class ArticlesService {
    constructor(
        private readonly repository : ArticlesRepository
    ) {}

    public async paginateArticles(options : IPaginationOptions, searchOptions?: FindOptionsWhere<Article> | FindManyOptions<Article>) {
        return this.repository.paginate(options, searchOptions);
    }

    public async getArticleById(id : number|string) : Promise<Article> {
        return this.repository.getArticle(id);
    }

    public async createArticle(articleDTO : ArticleDTO, avatarId : number) : Promise<Article> {
        const article : Article  = await this.getNewArticle(articleDTO, avatarId);
        
        return this.repository.save(article);
    }

    public async editArticle(articleDTO : ArticleDTO, avatarId : number) : Promise<Article> {
        const article : Article  = await this.getArticle(articleDTO, avatarId);
        
        return this.repository.save(article);
    }

    private async getNewArticle(articleDTO : ArticleDTO, avatarId : number) : Promise<Article> {
        const article : Article = new Article();

        article.title = articleDTO.title;
        article.description = articleDTO.description;
        article.content = articleDTO.content;
        article.image = articleDTO.image;
        article.thumbnail = articleDTO.thumbnail;
        article.hidden = articleDTO.hidden ? 1 : 0;
        article.pinned = articleDTO.pinned ? 1 : 0;
        article.author_id = avatarId;
        article.created_at = new Date();

        return article;
    }

    private async getArticle(articleDTO : ArticleDTO, avatarId : number) : Promise<Article> {
        const article : Article = await this.repository.getArticle(articleDTO.id);

        article.title = articleDTO.title;
        article.description = articleDTO.description;
        article.content = articleDTO.content;
        article.image = articleDTO.image;
        article.thumbnail = articleDTO.thumbnail;
        article.hidden = articleDTO.hidden ? 1 : 0;
        article.pinned = articleDTO.pinned ? 1 : 0;
        article.author_id = avatarId;

        return article;
    }
}
