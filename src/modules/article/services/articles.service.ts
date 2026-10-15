import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { AuditLogService } from '../../audit/audit-log.service';
import { ArticleDto } from '../dtos/article.dto';
import { Article } from '../entities/article.entity';

const MAX_PAGE_SIZE = 100;

interface ArticleActor {
  accountId: number;
  playerId: number | null;
  requestId?: string;
}

@Injectable()
export class ArticlesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audit: AuditLogService,
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
  ) {}

  async listPublished(page: number, limit: number, search?: unknown) {
    return this.list({ page, limit, search }, true);
  }

  async listForAdministration(page: number, limit: number, search?: string) {
    return this.list({ page, limit, search }, false);
  }

  async getPublishedById(id: number): Promise<Article> {
    const article = await this.articles.findOne({
      where: { id, hidden: false, publishedAt: Not(IsNull()) },
    });
    if (!article) throw new NotFoundException('Published article was not found.');
    return article;
  }

  async getForAdministration(id: number): Promise<Article> {
    const article = await this.articles.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article was not found.');
    return article;
  }

  async getPublishedBySlug(slug: string): Promise<Article> {
    if (slug.length > 255 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new BadRequestException('Article slug is invalid.');
    }
    const article = await this.articles.findOne({
      where: { slug, hidden: false, publishedAt: Not(IsNull()) },
    });
    if (!article) throw new NotFoundException('Published article was not found.');
    return article;
  }

  createDraft(input: ArticleDto, actor: ArticleActor): Promise<Article> {
    return this.write('article.draft.create', 'article', null, actor, async (manager) => {
      const repository = manager.getRepository(Article);
      const article = repository.create({
        title: input.title.trim(),
        slug: await this.uniqueSlug(repository, input.title),
        description: input.description.trim(),
        content: input.content,
        image: input.image ?? '',
        thumbnail: input.thumbnail ?? '',
        authorAccountId: actor.accountId,
        hidden: true,
        pinned: false,
        publishedAt: null,
      });
      const saved = await repository.save(article);
      await this.audit.record(
        {
          actorAccountId: actor.accountId,
          actorPlayerId: actor.playerId,
          action: 'article.draft.create',
          targetType: 'article',
          targetId: String(saved.id),
          result: 'success',
          requestId: this.requestId(actor),
          details: { slug: saved.slug },
        },
        manager,
      );
      return saved;
    });
  }

  update(id: number, input: ArticleDto, actor: ArticleActor): Promise<Article> {
    return this.write('article.update', 'article', String(id), actor, async (manager) => {
      const repository = manager.getRepository(Article);
      const article = await repository.findOne({ where: { id } });
      if (!article) throw new NotFoundException('Article was not found.');
      article.title = input.title.trim();
      article.slug = await this.uniqueSlug(repository, input.title, id);
      article.description = input.description.trim();
      article.content = input.content;
      if (input.image !== undefined) article.image = input.image;
      if (input.thumbnail !== undefined) article.thumbnail = input.thumbnail;
      return repository.save(article);
    });
  }

  publish(id: number, actor: ArticleActor): Promise<Article> {
    return this.write('article.publish', 'article', String(id), actor, async (manager) => {
      const repository = manager.getRepository(Article);
      const article = await repository.findOne({ where: { id } });
      if (!article) throw new NotFoundException('Article was not found.');
      if (article.hidden) article.publishedAt = new Date();
      article.hidden = false;
      return repository.save(article);
    });
  }

  remove(id: number, actor: ArticleActor): Promise<void> {
    return this.write('article.delete', 'article', String(id), actor, async (manager) => {
      const repository = manager.getRepository(Article);
      const article = await repository.findOne({ where: { id } });
      if (!article) throw new NotFoundException('Article was not found.');
      await repository.remove(article);
    });
  }

  private async list(
    input: { page: number; limit: number; search?: unknown },
    publishedOnly: boolean,
  ) {
    this.validatePagination(input.page, input.limit);
    let search: string | undefined;
    if (input.search !== undefined) {
      if (typeof input.search !== 'string') {
        throw new BadRequestException('Article search must be a string.');
      }
      if (input.search.length > 80) {
        throw new BadRequestException('Article search must be at most 80 characters.');
      }
      search = input.search.trim();
    }
    const query = this.articles.createQueryBuilder('article');
    if (publishedOnly) {
      query
        .andWhere('article.hidden = :hidden', { hidden: false })
        .andWhere('article.publishedAt IS NOT NULL');
    }
    if (search) {
      const term = search.replace(/[\\%_]/g, '\\$&');
      query.andWhere('(article.title LIKE :term OR article.description LIKE :term)', {
        term: `%${term}%`,
      });
    }
    const total = await query.clone().getCount();
    const items = await query
      .orderBy('article.pinned', 'DESC')
      .addOrderBy('COALESCE(article.publishedAt, article.createdAt)', 'DESC')
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getMany();
    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems: total,
        itemsPerPage: input.limit,
        totalPages: Math.ceil(total / input.limit),
        currentPage: input.page,
      },
    };
  }

  private async uniqueSlug(
    repository: Repository<Article>,
    title: string,
    excludingId?: number,
  ): Promise<string> {
    const base =
      title
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 220) || 'article';
    for (let suffix = 1; suffix <= 100; suffix += 1) {
      const slug = suffix === 1 ? base : `${base}-${suffix}`;
      const query = repository.createQueryBuilder('article').where('article.slug = :slug', { slug });
      if (excludingId !== undefined) query.andWhere('article.id != :excludingId', { excludingId });
      if (!(await query.getOne())) return slug;
    }
    throw new ConflictException('A unique article slug could not be generated.');
  }

  private async write<T>(
    action: string,
    targetType: string,
    targetId: string | null,
    actor: ArticleActor,
    operation: (manager: import('typeorm').EntityManager) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const result = await operation(manager);
        if (action !== 'article.draft.create') {
          await this.audit.record(
            {
              actorAccountId: actor.accountId,
              actorPlayerId: actor.playerId,
              action,
              targetType,
              targetId,
              result: 'success',
              requestId: this.requestId(actor),
            },
            manager,
          );
        }
        return result;
      });
    } catch (error) {
      await this.audit.record({
        actorAccountId: actor.accountId,
        actorPlayerId: actor.playerId,
        action,
        targetType,
        targetId,
        result: 'failure',
        requestId: this.requestId(actor),
        details: { errorType: error instanceof Error ? error.name : 'UnknownError' },
      });
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('An article with that slug already exists.');
      }
      throw error;
    }
  }

  private requestId(actor: ArticleActor): string {
    return actor.requestId?.slice(0, 128) || randomUUID();
  }

  private validatePagination(page: number, limit: number): void {
    if (!Number.isSafeInteger(page) || page < 1 || page > 100_000) {
      throw new BadRequestException('page must be an integer between 1 and 100000.');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
      throw new BadRequestException(`limit must be an integer between 1 and ${MAX_PAGE_SIZE}.`);
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    if (!(error instanceof Error) || !('driverError' in error)) return false;
    return (error as Error & { driverError?: { code?: string } }).driverError?.code ===
      'ER_DUP_ENTRY';
  }
}
