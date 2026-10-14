import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditRecordInput {
  actorAccountId: number | null;
  actorPlayerId: number | null;
  action: string;
  targetType: string;
  targetId: string | null;
  result: 'success' | 'failure';
  requestId: string;
  details?: Record<string, string | number | boolean | null> | null;
}

export interface AuditQuery {
  page: number;
  limit: number;
  actorAccountId?: number;
  action?: string;
  targetType?: string;
  from?: Date;
  to?: Date;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly logs: Repository<AuditLog>,
  ) {}

  record(input: AuditRecordInput, manager?: EntityManager): Promise<AuditLog> {
    const repository = manager?.getRepository(AuditLog) ?? this.logs;
    return repository.save(
      repository.create({
        ...input,
        requestId: input.requestId.slice(0, 128),
        details: input.details ?? null,
      }),
    );
  }

  async query(input: AuditQuery): Promise<{
    items: AuditLog[];
    page: number;
    limit: number;
    total: number;
  }> {
    if (input.from && input.to && input.from > input.to) {
      throw new BadRequestException('from must be earlier than or equal to to.');
    }
    if (input.from && input.to && input.to.getTime() - input.from.getTime() > 31 * 86400_000) {
      throw new BadRequestException('Audit time ranges may not exceed 31 days.');
    }

    const query = this.logs.createQueryBuilder('audit');
    this.applyFilters(query, input);
    const total = await query.getCount();
    const items = await query
      .orderBy('audit.createdAt', 'DESC')
      .addOrderBy('audit.id', 'DESC')
      .skip((input.page - 1) * input.limit)
      .take(input.limit)
      .getMany();
    return { items, page: input.page, limit: input.limit, total };
  }

  private applyFilters(query: SelectQueryBuilder<AuditLog>, input: AuditQuery): void {
    if (input.actorAccountId !== undefined) {
      query.andWhere('audit.actorAccountId = :actorAccountId', {
        actorAccountId: input.actorAccountId,
      });
    }
    if (input.action) query.andWhere('audit.action = :action', { action: input.action });
    if (input.targetType) {
      query.andWhere('audit.targetType = :targetType', { targetType: input.targetType });
    }
    if (input.from) query.andWhere('audit.createdAt >= :from', { from: input.from });
    if (input.to) query.andWhere('audit.createdAt <= :to', { to: input.to });
  }
}
