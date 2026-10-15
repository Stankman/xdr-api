import { DataSource } from 'typeorm';
import { XdrPermissionGroupInheritance1792100000000 } from './1792100000000-XdrPermissionGroupInheritance';

describe('XDR permission group inheritance migration', () => {
  it('adds XDR-only inheritance and seeds explicit role grants', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new XdrPermissionGroupInheritance1792100000000().up(runner);
    const sql = query.mock.calls.map(([statement]) => statement as string);

    expect(sql[0]).toContain(
      'CREATE TABLE IF NOT EXISTS xdr_permission_group_parents',
    );
    expect(sql[0]).toContain(
      'UNIQUE INDEX UQ_xdr_permission_group_parents_child_parent',
    );
    expect(sql[0]).toContain('REFERENCES xdr_permission_groups');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM xdr_permission_group_nodes'),
      ['admin'],
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT child.id, parent.id'),
      ['admin', 'content_editor'],
    );
    expect(
      sql.every(
        (statement) => !/\bplayers|turbo_permission_groups\b/.test(statement),
      ),
    ).toBe(true);
  });

  it('removes only the hierarchy table and restores the legacy wildcard on revert', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new XdrPermissionGroupInheritance1792100000000().down(runner);
    expect(query.mock.calls.map(([statement]) => statement)).toEqual([
      'DROP TABLE IF EXISTS xdr_permission_group_parents',
      expect.stringContaining("SELECT id, '*', 1"),
    ]);
  });
});
