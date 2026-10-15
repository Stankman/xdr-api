import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StaffGroupDto } from './staff-directory.dto';

export const STAFF_MEMBERS_PER_GROUP = 100;

/**
 * Public, read-only staff directory. Only groups with a positive weight are
 * listed, and members are represented solely by their primary (first linked)
 * avatar: no account ids, emails or membership metadata are exposed.
 */
@Injectable()
export class StaffDirectoryService {
  private readonly logger = new Logger(StaffDirectoryService.name);

  constructor(private readonly dataSource: DataSource) {}

  async list(now = new Date()): Promise<StaffGroupDto[]> {
    const result: unknown = await this.dataSource.query(
      `SELECT g.id AS group_id, g.name AS group_name, g.display_name, g.weight,
        p.name AS username, p.figure, p.motto, p.status
       FROM xdr_permission_groups g
       LEFT JOIN xdr_account_permission_groups m
         ON m.group_id = g.id AND (m.expires_at IS NULL OR m.expires_at > ?)
       LEFT JOIN xdr_account_players l ON l.id = (
         SELECT l2.id FROM xdr_account_players l2
         WHERE l2.account_id = m.account_id
         ORDER BY l2.created_at ASC, l2.id ASC LIMIT 1)
       LEFT JOIN players p ON p.id = l.player_id
       WHERE g.weight > 0
       ORDER BY g.weight DESC, g.name ASC, p.name ASC`,
      [now],
    );
    if (!Array.isArray(result)) this.invalid('query result');

    const groups = new Map<number, StaffGroupDto>();
    for (const value of result as unknown[]) {
      if (typeof value !== 'object' || value === null)
        this.invalid('query row');
      const row = value as Record<string, unknown>;
      const id = Number(row.group_id);
      let group = groups.get(id);
      if (!group) {
        group = {
          name: this.text(row.group_name),
          displayName: this.text(row.display_name),
          weight: Number(row.weight),
          members: [],
        };
        groups.set(id, group);
      }
      if (row.username === null || row.username === undefined) continue;
      if (group.members.length >= STAFF_MEMBERS_PER_GROUP) continue;
      group.members.push({
        username: this.text(row.username),
        look: typeof row.figure === 'string' ? row.figure : '',
        motto: typeof row.motto === 'string' ? row.motto : '',
        online: Number(row.status) === 1,
      });
    }
    return [...groups.values()];
  }

  private text(value: unknown): string {
    if (typeof value !== 'string' || !value.length) this.invalid('text field');
    return value as string;
  }

  private invalid(reason: string): never {
    this.logger.error(`Inconsistent staff directory data: ${reason}`);
    throw new InternalServerErrorException();
  }
}
