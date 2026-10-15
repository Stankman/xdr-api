import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BoundedPagePipe } from '../../../common/pipes/bounded-page.pipe';
import { PositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { ArticlesService } from '../services/articles.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, maximum: 100 })
  @ApiQuery({ name: 'q', required: false, type: String, maxLength: 80 })
  published(
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('q') search?: unknown,
  ) {
    return this.articles.listPublished(page, limit, search);
  }

  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.articles.getPublishedBySlug(slug);
  }

  @Get(':id')
  byId(@Param('id', PositiveIntPipe) id: number) {
    return this.articles.getPublishedById(id);
  }
}
