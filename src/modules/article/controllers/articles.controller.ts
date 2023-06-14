import { Controller, UseGuards, Get, Query, DefaultValuePipe, ParseIntPipe, Post, Req, Body, Put, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from 'express';
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { RolePermission } from "src/common/decorators/role-permission.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AppConfigService } from "src/config/app/app-config.service";
import { Account } from "src/modules/account/entities/account.entity";
import { FindManyOptions, FindOptionsWhere } from "typeorm";
import { ArticleDTO } from "../dtos/article.dto";
import { Article } from "../entities/article.entity";
import { ArticlesService } from "../services/articles.service";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { AuthGuard } from "src/common/guards/auth.guard";
import { AccountGuardService } from '../../account/services/account-guard.service';
import { ClassTransformOptions } from "class-transformer";
import { defaultAvatarGroup } from "src/modules/avatar/serializers/avatar.serializer";

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly accountGuardService : AccountGuardService,
        private readonly articlesService : ArticlesService,
        private readonly appConfigService : AppConfigService
    ) {}

    @RolePermission('manage-articles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get('all')
    public async paginateArticles(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Article, IPaginationMeta>> {
        const options : IPaginationOptions = {
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
        const options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        const searchOptions : FindManyOptions<Article> = {
            where: {
                hidden: false
            },
            relations: ['author']
        };

        return await this.articlesService.paginateArticles(options, searchOptions);
    }

    @Get(':id')
    public async getArticle(@Param() params : any) : Promise<Article> {
        return await this.articlesService.getAvailableArticleById(params.id);
    }

    @RolePermission('manage-articles')
    @UseGuards(AuthGuard, RolesGuard)
    @Get('all/:id')
    public async getAllArticle(@Param() params : any) : Promise<Article> {
        return await this.articlesService.getArticleById(params.id);
    }

    @RolePermission('manage-articles')
    @UseGuards(AuthGuard, RolesGuard)
    @Post()
    public async createArticle(@Req() req : Request, @Body() articleDTO : ArticleDTO) : Promise<Article> {
        const loggedAccount : Account = (await this.accountGuardService.getLoggedAccount(req));
        const loggedAvatar : Avatar = loggedAccount.activeAvatar;
        return this.articlesService.createArticle(articleDTO, loggedAvatar);
    }

    @RolePermission('manage-articles')
    @UseGuards(AuthGuard, RolesGuard)
    @Put(':id')
    public async updateArticle(@Req() req : Request, @Param() params : any, @Body() articleDTO : ArticleDTO) : Promise<Article> {
        const loggedAccount : Account = (await this.accountGuardService.getLoggedAccount(req));
        const loggedAvatar : Avatar = loggedAccount.activeAvatar; //TODO Use this for log system
        return this.articlesService.editArticle(params.id, articleDTO);
    }
}
