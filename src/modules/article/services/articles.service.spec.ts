import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLogService } from '../../audit/audit-log.service';
import { Article } from '../entities/article.entity';
import { ArticlesService } from './articles.service';

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
});
