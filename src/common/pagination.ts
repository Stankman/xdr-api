import { BadRequestException } from '@nestjs/common';
import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';

export interface IPaginationOptions {
  page: number;
  limit: number;
  route?: string;
}

export interface IPaginationMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface IPaginationLinks {
  first: string;
  previous: string;
  next: string;
  last: string;
}

export class Pagination<T, M = IPaginationMeta> {
  constructor(
    public readonly items: T[],
    public readonly meta: M,
    public readonly links?: IPaginationLinks,
  ) {}
}

export async function paginate<T extends ObjectLiteral>(
  repository: Repository<T>,
  options: IPaginationOptions,
  searchOptions?: FindManyOptions<T>,
): Promise<Pagination<T>> {
  const { page, limit, route } = options;
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1
  ) {
    throw new BadRequestException('page and limit must be positive integers');
  }

  const [items, totalItems] = await Promise.all([
    repository.find({
      ...searchOptions,
      skip: (page - 1) * limit,
      take: limit,
    }),
    repository.count(searchOptions),
  ]);
  const totalPages = Math.ceil(totalItems / limit);
  const meta: IPaginationMeta = {
    itemCount: items.length,
    totalItems,
    itemsPerPage: limit,
    totalPages,
    currentPage: page,
  };
  const separator = route?.includes('?') ? '&' : '?';
  const pageLink = (target: number) =>
    `${route}${separator}page=${target}&limit=${limit}`;
  const links = route
    ? {
        first: `${route}${separator}limit=${limit}`,
        previous: page > 1 ? pageLink(page - 1) : '',
        next: page < totalPages ? pageLink(page + 1) : '',
        last: totalPages > 0 ? pageLink(totalPages) : '',
      }
    : undefined;

  return new Pagination(items, meta, links);
}
