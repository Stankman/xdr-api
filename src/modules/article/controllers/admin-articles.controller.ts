import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { BoundedPagePipe } from '../../../common/pipes/bounded-page.pipe';
import { PositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { ArticleDto } from '../dtos/article.dto';
import { ArticlesService } from '../services/articles.service';

@ApiTags('Administrative articles')
@ApiBearerAuth()
@Controller('admin/articles')
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission('cms.articles.manage')
export class AdminArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, maximum: 100 })
  @ApiQuery({ name: 'q', required: false, type: String, maxLength: 80 })
  list(
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('q') search?: string,
  ) {
    return this.articles.listForAdministration(page, limit, search);
  }

  @Get(':id')
  byId(@Param('id', PositiveIntPipe) id: number) {
    return this.articles.getForAdministration(id);
  }

  @Post()
  create(@Body() input: ArticleDto, @Req() request: AuthenticatedRequest) {
    return this.articles.createDraft(input, this.actor(request));
  }

  @Put(':id')
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() input: ArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.update(id, input, this.actor(request));
  }

  @Post(':id/publish')
  publish(
    @Param('id', PositiveIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.publish(id, this.actor(request));
  }

  @Delete(':id')
  remove(
    @Param('id', PositiveIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articles.remove(id, this.actor(request));
  }

  private actor(request: AuthenticatedRequest) {
    return {
      accountId: request.xdr_uid,
      playerId: null,
      requestId: request.requestId,
    };
  }
}
