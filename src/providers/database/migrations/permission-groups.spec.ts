import { DataSource } from 'typeorm';
import { XdrPermissionGroups1792000000000 } from './1792000000000-XdrPermissionGroups';

describe('XDR permission groups migration', () => {
  it('creates only xdr_ permission tables and seeds default and admin idempotently', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new XdrPermissionGroups1792000000000().up(runner);

    const sql = query.mock.calls.map(([statement]) => statement as string);
    const created = sql
      .map(
        (statement) => /CREATE TABLE IF NOT EXISTS (\w+)/.exec(statement)?.[1],
      )
      .filter(Boolean);
    expect(created).toEqual([
      'xdr_permission_groups',
      'xdr_permission_group_nodes',
      'xdr_account_permission_groups',
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ON DUPLICATE KEY'),
      ['default', 'Default', 0, 'admin', 'Administrator', 100],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT id, '*', 1"),
      ['admin'],
    );
    expect(
      sql.every(
        (statement) => !/\b(players|permission_groups)\b/.test(statement),
      ),
    ).toBe(true);
  });

  it('drops the tables children first', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new XdrPermissionGroups1792000000000().down(runner);
    expect(query.mock.calls.map(([statement]) => statement)).toEqual([
      'DROP TABLE IF EXISTS xdr_account_permission_groups',
      'DROP TABLE IF EXISTS xdr_permission_group_nodes',
      'DROP TABLE IF EXISTS xdr_permission_groups',
    ]);
  });
});
