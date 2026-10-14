import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { paginate } from './pagination';

interface Item {
  id: number;
}

describe('pagination', () => {
  const repository = new DataSource({ type: 'mysql' }).getRepository<Item>(
    'Item',
  );

  beforeEach(() => {
    jest.spyOn(repository, 'find').mockResolvedValue([{ id: 11 }]);
    jest.spyOn(repository, 'count').mockResolvedValue(21);
  });

  afterEach(() => jest.restoreAllMocks());

  it('preserves filters, page offsets, metadata, and navigation links', async () => {
    const result = await paginate(
      repository,
      { page: 2, limit: 10, route: 'https://example.test/items' },
      { where: { id: 11 } },
    );
    expect(repository.find).toHaveBeenCalledWith({
      where: { id: 11 },
      skip: 10,
      take: 10,
    });
    expect(repository.count).toHaveBeenCalledWith({ where: { id: 11 } });
    expect(result).toEqual({
      items: [{ id: 11 }],
      meta: {
        itemCount: 1,
        totalItems: 21,
        itemsPerPage: 10,
        totalPages: 3,
        currentPage: 2,
      },
      links: {
        first: 'https://example.test/items?limit=10',
        previous: 'https://example.test/items?page=1&limit=10',
        next: 'https://example.test/items?page=3&limit=10',
        last: 'https://example.test/items?page=3&limit=10',
      },
    });
  });

  it('handles existing query strings and the final page', async () => {
    const result = await paginate(repository, {
      page: 3,
      limit: 10,
      route: 'https://example.test/items?search=test',
    });
    expect(result.links?.next).toBe('');
    expect(result.links?.previous).toBe(
      'https://example.test/items?search=test&page=2&limit=10',
    );
  });

  it('handles empty results and first-page boundaries', async () => {
    jest.spyOn(repository, 'find').mockResolvedValue([]);
    jest.spyOn(repository, 'count').mockResolvedValue(0);
    const result = await paginate(repository, {
      page: 1,
      limit: 10,
      route: '/items',
    });
    expect(result.meta.totalPages).toBe(0);
    expect(result.links).toEqual({
      first: '/items?limit=10',
      previous: '',
      next: '',
      last: '',
    });
  });

  it('omits links when there is no route', async () => {
    const result = await paginate(repository, { page: 1, limit: 10 });
    expect(result.links).toBeUndefined();
  });

  it.each([
    { page: 0, limit: 10 },
    { page: -1, limit: 10 },
    { page: 1.5, limit: 10 },
    { page: 1, limit: 0 },
    { page: 1, limit: -1 },
    { page: 1, limit: Infinity },
  ])('rejects invalid pagination before querying: %j', async (options) => {
    await expect(paginate(repository, options)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.find).not.toHaveBeenCalled();
    expect(repository.count).not.toHaveBeenCalled();
  });

  it('propagates database failures', async () => {
    jest
      .spyOn(repository, 'find')
      .mockRejectedValue(new Error('Database unavailable'));
    await expect(paginate(repository, { page: 1, limit: 10 })).rejects.toThrow(
      'Database unavailable',
    );
  });
});
