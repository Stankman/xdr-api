import { BadRequestException, NotFoundException, Type, ValidationPipe } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLogService } from '../../audit/audit-log.service';
import { Article } from '../entities/article.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from '../controllers/articles.controller';

describe('ArticlesService public visibility', () => {
  const repository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as unknown as Repository<Article>;
  const service = new ArticlesService(
    {} as DataSource,
    {} as AuditLogService,
    repository,
  );

  beforeEach(() => jest.clearAllMocks());

  it('returns only an article whose hidden flag is false by ID', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.getPublishedById(12)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 12, hidden: false, publishedAt: expect.anything() },
    });
  });

  it('applies the published visibility condition to slug lookups', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.getPublishedBySlug('unpublished-draft')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'unpublished-draft',
        hidden: false,
        publishedAt: expect.anything(),
      },
    });
  });

  it('excludes drafts and malformed unpublished rows from public lists', async () => {
    const query = {
      andWhere: jest.fn(),
      clone: jest.fn(),
      getCount: jest.fn().mockResolvedValue(0),
      orderBy: jest.fn(),
      addOrderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    query.andWhere.mockReturnValue(query);
    query.clone.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.addOrderBy.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.take.mockReturnValue(query);
    repository.createQueryBuilder = jest.fn().mockReturnValue(query);

    await service.listPublished(1, 10);

    expect(query.andWhere).toHaveBeenNthCalledWith(1, 'article.hidden = :hidden', {
      hidden: false,
    });
    expect(query.andWhere).toHaveBeenNthCalledWith(2, 'article.publishedAt IS NOT NULL');
  });

  function listQuery(total = 0) {
    const query = {
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(total),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    repository.createQueryBuilder = jest.fn().mockReturnValue(query);
    return query;
  }

  it('searches published titles/descriptions with literal wildcards and preserves ordering', async () => {
    const query = listQuery(25);
    const result = await service.listPublished(2, 10, '  sale%_\\  ');
    expect(query.andWhere).toHaveBeenNthCalledWith(1, 'article.hidden = :hidden', { hidden: false });
    expect(query.andWhere).toHaveBeenNthCalledWith(2, 'article.publishedAt IS NOT NULL');
    expect(query.andWhere).toHaveBeenNthCalledWith(3,
      '(article.title LIKE :term OR article.description LIKE :term)', { term: '%sale\\%\\_\\\\%' });
    expect(query.orderBy).toHaveBeenCalledWith('article.pinned', 'DESC');
    expect(query.addOrderBy).toHaveBeenCalledWith('COALESCE(article.publishedAt, article.createdAt)', 'DESC');
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.take).toHaveBeenCalledWith(10);
    expect(result.meta).toEqual({ itemCount: 0, totalItems: 25, itemsPerPage: 10, totalPages: 3, currentPage: 2 });
  });

  it('treats whitespace as no search and accepts the maximum length', async () => {
    const query = listQuery();
    await service.listPublished(1, 10, '   ');
    expect(query.andWhere).toHaveBeenCalledTimes(2);
    await expect(service.listPublished(1, 10, 'x'.repeat(80))).resolves.toBeDefined();
  });

  it('rejects oversized and non-scalar search values before querying', async () => {
    listQuery();
    await expect(service.listPublished(1, 10, 'x'.repeat(81))).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.listPublished(1, 10, ['a', 'b'])).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects repeated search parameters after the global query transformation', async () => {
    listQuery();
    const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
    const controller = new ArticlesController(service);
    for (const method of ['published', 'available'] as const) {
      const parameterTypes: Type<unknown>[] = Reflect.getMetadata('design:paramtypes', ArticlesController.prototype, method);
      const search: unknown = await pipe.transform(['room', 'hotel'], {
        type: 'query', metatype: parameterTypes[2], data: 'q',
      });
      await expect(controller[method](1, 10, search)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('forwards search from both public controller routes and retains defaults', async () => {
    const controller = new ArticlesController(service);
    const list = jest.spyOn(service, 'listPublished').mockResolvedValue({
      items: [], meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
    });
    await controller.published(2, 10, 'news');
    await controller.available(3, 5, 'hotel');
    await controller.available();
    expect(list).toHaveBeenNthCalledWith(1, 2, 10, 'news');
    expect(list).toHaveBeenNthCalledWith(2, 3, 5, 'hotel');
    expect(list).toHaveBeenNthCalledWith(3, 1, 10, undefined);
    list.mockRestore();
  });
});
