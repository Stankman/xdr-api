import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppConfigService } from "src/config/app/app-config.service";
import { ArticlesService } from "../services/articles.service";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { Permission } from "src/common/decorators/permission.decorator";
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from "src/common/guards/roles.guard";
import { Article } from "../entities/article.entity";
import { FindManyOptions, FindOptionsWhere } from 'typeorm';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly articlesService : ArticlesService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Permission('view-articles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get('all')
    public async paginateArticles(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Article, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return await this.articlesService.paginateArticles(options);
    }

    @Get('available')
    public async paginateAvailableArticles(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Article, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        
        let searchOptions : FindOptionsWhere<Article>[] = [
            {
                hidden: 0
            }
        ]

        return await this.articlesService.paginateArticles(options, searchOptions);
    }
}
