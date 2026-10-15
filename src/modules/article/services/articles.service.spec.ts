import { BadRequestException, NotFoundException, Type, ValidationPipe } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLogService } from '../../audit/audit-log.service';
import { Article } from '../entities/article.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from '../controllers/articles.controller';
import { AdminArticlesController } from '../controllers/admin-articles.controller';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { XDR_PERMISSION_KEY as PERMISSION_KEY } from '../../../common/decorators/permission.decorator';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { ArticleDto } from '../dtos/article.dto';

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
    const parameterTypes: Type<unknown>[] = Reflect.getMetadata('design:paramtypes', ArticlesController.prototype, 'published');
    const search: unknown = await pipe.transform(['room', 'hotel'], {
      type: 'query', metatype: parameterTypes[2], data: 'q',
    });
    await expect(controller.published(1, 10, search)).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('forwards search from the public list route and retains defaults', async () => {
    const controller = new ArticlesController(service);
    const list = jest.spyOn(service, 'listPublished').mockResolvedValue({
      items: [], meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
    });
    await controller.published(2, 10, 'news');
    await controller.published();
    expect(list).toHaveBeenNthCalledWith(1, 2, 10, 'news');
    expect(list).toHaveBeenNthCalledWith(2, 1, 10, undefined);
    list.mockRestore();
  });

  it('no longer exposes the legacy public list or admin handlers', () => {
    expect(ArticlesController.prototype).not.toHaveProperty('available');
    expect(ArticlesController.prototype).not.toHaveProperty('adminList');
  });
});

describe('ArticlesService administrative access', () => {
  const repository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as unknown as Repository<Article>;
  const service = new ArticlesService({} as DataSource, {} as AuditLogService, repository);

  function listQuery(total = 0, items: Partial<Article>[] = []) {
    const query = {
      andWhere: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(total),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(items),
    };
    repository.createQueryBuilder = jest.fn().mockReturnValue(query);
    return query;
  }

  beforeEach(() => jest.clearAllMocks());

  it('includes unavailable articles in the administrative list', async () => {
    const draft = { id: 3, hidden: true, publishedAt: null };
    const query = listQuery(1, [draft]);
    const result = await service.listForAdministration(1, 10);
    expect(query.andWhere).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [draft],
      meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
    });
  });

  it('keeps search, ordering and pagination in the administrative list', async () => {
    const query = listQuery(25);
    await service.listForAdministration(2, 10, ' news ');
    expect(query.andWhere).toHaveBeenCalledTimes(1);
    expect(query.andWhere).toHaveBeenCalledWith(
      '(article.title LIKE :term OR article.description LIKE :term)', { term: '%news%' });
    expect(query.orderBy).toHaveBeenCalledWith('article.pinned', 'DESC');
    expect(query.skip).toHaveBeenCalledWith(10);
  });

  it('returns an unavailable article by ID without the availability condition', async () => {
    const draft = { id: 9, hidden: true, publishedAt: null } as Article;
    repository.findOne = jest.fn().mockResolvedValue(draft);
    await expect(service.getForAdministration(9)).resolves.toBe(draft);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 9 } });
  });

  it('reports a missing article by ID as not found', async () => {
    repository.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.getForAdministration(404)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('delegates administrative controller routes to the administrative service methods', async () => {
    const controller = new AdminArticlesController(service);
    const page = { items: [], meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } };
    const list = jest.spyOn(service, 'listForAdministration').mockResolvedValue(page);
    const byId = jest.spyOn(service, 'getForAdministration').mockResolvedValue({ id: 5 } as Article);
    await expect(controller.list(2, 5, 'q')).resolves.toBe(page);
    await controller.list();
    await expect(controller.byId(5)).resolves.toEqual({ id: 5 });
    expect(list).toHaveBeenNthCalledWith(1, 2, 5, 'q');
    expect(list).toHaveBeenNthCalledWith(2, 1, 10, undefined);
    expect(byId).toHaveBeenCalledWith(5);
  });

  it('protects every administrative route with the /admin authorization mechanism', () => {
    expect(Reflect.getMetadata('path', AdminArticlesController)).toBe('admin/articles');
    expect(Reflect.getMetadata('__guards__', AdminArticlesController)).toEqual([AuthGuard, PermissionGuard]);
    expect(Reflect.getMetadata(PERMISSION_KEY, AdminArticlesController)).toBe('cms.articles.manage');
  });

  it('delegates administrative write routes with the authenticated actor', async () => {
    const controller = new AdminArticlesController(service);
    const request = { xdr_uid: 42, requestId: 'req-1' } as AuthenticatedRequest;
    const actor = { accountId: 42, playerId: null, requestId: 'req-1' };
    const input = { title: 'T', description: 'D', content: 'C' } as ArticleDto;
    const create = jest.spyOn(service, 'createDraft').mockResolvedValue({ id: 1 } as Article);
    const update = jest.spyOn(service, 'update').mockResolvedValue({ id: 1 } as Article);
    const publish = jest.spyOn(service, 'publish').mockResolvedValue({ id: 1 } as Article);
    const remove = jest.spyOn(service, 'remove').mockResolvedValue(undefined);
    await controller.create(input, request);
    await controller.update(1, input, request);
    await controller.publish(1, request);
    await controller.remove(1, request);
    expect(create).toHaveBeenCalledWith(input, actor);
    expect(update).toHaveBeenCalledWith(1, input, actor);
    expect(publish).toHaveBeenCalledWith(1, actor);
    expect(remove).toHaveBeenCalledWith(1, actor);
  });

  it('keeps the public controller read-only', () => {
    for (const method of ['create', 'update', 'publish', 'remove']) {
      expect(ArticlesController.prototype).not.toHaveProperty(method);
    }
  });
});
