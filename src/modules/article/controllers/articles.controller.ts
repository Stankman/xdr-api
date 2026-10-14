import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { RequireTurboPermission } from '../../../common/decorators/turbo-permission.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TurboAdminGuard } from '../../../common/guards/turbo-admin.guard';
import { TurboPermissionGuard } from '../../../common/guards/turbo-permission.guard';
import { BoundedPagePipe } from '../../../common/pipes/bounded-page.pipe';
import { PositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { ArticleDto } from '../dtos/article.dto';
import { ArticlesService } from '../services/articles.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, maximum: 100 })
  published(
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.articles.listPublished(page, limit);
  }

  @Get('available')
  available(
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.articles.listPublished(page, limit);
  }

  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.articles.getPublishedBySlug(slug);
  }

  @Get('admin')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.articles.manage')
  adminList(
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('q') search?: string,
  ) {
    return this.articles.listForAdministration(page, limit, search);
  }

  @Post()
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.articles.manage')
  create(@Body() input: ArticleDto, @Req() request: AuthenticatedRequest) {
    return this.articles.createDraft(input, this.actor(request));
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.articles.manage')
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() input: ArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.update(id, input, this.actor(request));
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.articles.manage')
  publish(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.articles.publish(id, this.actor(request));
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.articles.manage')
  remove(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
    return this.articles.remove(id, this.actor(request));
  }

  @Get(':id')
  byId(@Param('id', PositiveIntPipe) id: number) {
    return this.articles.getPublishedById(id);
  }

  private actor(request: AuthenticatedRequest) {
    if (!request.turbo_admin_player_id) {
      throw new ForbiddenException('Turbo Admin identity is required.');
    }
    return {
      accountId: request.xdr_uid,
      playerId: request.turbo_admin_player_id,
      requestId: request.requestId,
    };
  }
}
