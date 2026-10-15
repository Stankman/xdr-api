import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StaffDirectoryService } from './staff-directory.service';

describe('StaffDirectoryService', () => {
  const create = (rows: unknown) => {
    const query = jest.fn().mockResolvedValue(rows);
    const service = new StaffDirectoryService({
      query,
    } as unknown as DataSource);
    return { service, query };
  };

  it('groups public avatar data by permission group and keeps empty groups', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const { service, query } = create([
      {
        group_id: 2,
        group_name: 'admin',
        display_name: 'Administrator',
        weight: 100,
        username: 'Frank',
        figure: 'hd-180-1',
        motto: 'Hi',
        status: 1,
      },
      {
        group_id: 2,
        group_name: 'admin',
        display_name: 'Administrator',
        weight: 100,
        username: 'Mia',
        figure: 'hd-600-1',
        motto: null,
        status: 0,
      },
      {
        group_id: 3,
        group_name: 'content_editor',
        display_name: 'Content Editor',
        weight: 50,
        username: null,
        figure: null,
        motto: null,
        status: null,
      },
    ]);

    await expect(service.list(now)).resolves.toEqual([
      {
        name: 'admin',
        displayName: 'Administrator',
        weight: 100,
        members: [
          { username: 'Frank', look: 'hd-180-1', motto: 'Hi', online: true },
          { username: 'Mia', look: 'hd-600-1', motto: '', online: false },
        ],
      },
      {
        name: 'content_editor',
        displayName: 'Content Editor',
        weight: 50,
        members: [],
      },
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('g.weight > 0'),
      [now],
    );
    expect(query.mock.calls[0][0]).not.toMatch(/email/i);
  });

  it('rejects malformed query results', async () => {
    const { service } = create(null);
    await expect(service.list()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
