import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ArticlesRepository } from '../repositories/articles.repository';
import { FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticlesService {
    constructor(
        private readonly repository : ArticlesRepository
    ) {}

    public async paginateArticles(options : IPaginationOptions, searchOptions?: FindOptionsWhere<Article> | FindManyOptions<Article>) {
        return this.repository.paginate(options, searchOptions);
    }
}
