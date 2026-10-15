import {
  PermissionGroupSource,
  collectSources,
  isValidAssignment,
  isValidGroupName,
  resolvePermission,
  specificity,
} from './permission-resolver';

const group = (
  name: string,
  weight: number,
  nodes: Record<string, boolean>,
  parents: PermissionGroupSource[] = [],
): PermissionGroupSource => ({
  name,
  weight,
  nodes: Object.entries(nodes).map(([node, value]) => ({ node, value })),
  parents,
});

describe('permission resolver', () => {
  const now = new Date('2030-01-01T00:00:00Z');

  it('ranks exact over the longest prefix wildcard over *', () => {
    expect(specificity('cms.audit.view', 'cms.audit.view')).toBe(
      Number.MAX_SAFE_INTEGER,
    );
    expect(specificity('cms.audit.*', 'cms.audit.view')).toBeGreaterThan(
      specificity('cms.*', 'cms.audit.view'),
    );
    expect(specificity('cms.*', 'cms.audit.view')).toBeGreaterThan(
      specificity('*', 'cms.audit.view'),
    );
    expect(specificity('*', 'cms.audit.view')).toBe(0);
  });

  it('does not let a prefix wildcard match the prefix itself or a sibling prefix', () => {
    expect(specificity('cms.audit.*', 'cms.audit')).toBe(-1);
    expect(specificity('cms.*', 'cmsx.audit')).toBe(-1);
    expect(specificity('cms.audit.view', 'cms.audit.views')).toBe(-1);
  });

  it('validates assignments and group names', () => {
    expect(isValidAssignment('*')).toBe(true);
    expect(isValidAssignment('cms.*')).toBe(true);
    expect(isValidAssignment('cms.articles.manage')).toBe(true);
    expect(isValidAssignment('cms*')).toBe(false);
    expect(isValidAssignment('CMS.x')).toBe(false);
    expect(isValidAssignment('cms..x')).toBe(false);
    expect(isValidGroupName('admin')).toBe(true);
    expect(isValidGroupName('Admin Group')).toBe(false);
  });

  it('grants through * and the most specific match within a group', () => {
    expect(
      resolvePermission([group('admin', 100, { '*': true })], 'cms.audit.view'),
    ).toBe(true);
    const mixed = [group('staff', 10, { 'cms.*': true, 'cms.audit.*': false })];
    expect(resolvePermission(mixed, 'cms.audit.view')).toBe(false);
    expect(resolvePermission(mixed, 'cms.articles.manage')).toBe(true);
  });

  it('lets a denial win an equally specific tie', () => {
    const sources = [
      {
        name: 'staff',
        weight: 10,
        nodes: [
          { node: 'cms.audit.view', value: true },
          { node: 'cms.audit.view', value: false },
        ],
      },
    ];
    expect(resolvePermission(sources, 'cms.audit.view')).toBe(false);
  });

  it('lets the heaviest group with an opinion decide', () => {
    const heavyDeny = group('muted', 50, { 'cms.articles.manage': false });
    const lightGrant = group('writer', 10, { 'cms.*': true });
    const sources = collectSources(
      [
        { group: lightGrant, expiresAt: null },
        { group: heavyDeny, expiresAt: null },
      ],
      null,
      now,
    );
    expect(sources.map((source) => source.name)).toEqual(['muted', 'writer']);
    expect(resolvePermission(sources, 'cms.articles.manage')).toBe(false);
    expect(resolvePermission(sources, 'cms.settings.manage')).toBe(true);
  });

  it('resolves a child before its inherited parent', () => {
    const editor = group('content_editor', 50, {
      'cms.articles.manage': true,
    });
    const admin = group(
      'admin',
      100,
      { 'cms.articles.manage': false, 'cms.audit.view': true },
      [editor],
    );
    const sources = collectSources(
      [{ group: admin, expiresAt: null }],
      null,
      now,
    );
    expect(sources.map((source) => source.name)).toEqual([
      'admin',
      'content_editor',
    ]);
    expect(resolvePermission(sources, 'cms.articles.manage')).toBe(false);
    expect(resolvePermission(sources, 'cms.audit.view')).toBe(true);
  });

  it('uses deterministic parent priority and visits a shared ancestor once', () => {
    const base = group('base', 1, { 'cms.audit.view': true });
    const lowerParent = group('a_parent', 10, {}, [base]);
    const higherParent = group('z_parent', 20, { 'cms.audit.view': false }, [
      base,
    ]);
    const child = group('child', 100, {}, [lowerParent, higherParent]);
    const sources = collectSources(
      [{ group: child, expiresAt: null }],
      null,
      now,
    );
    expect(sources.map((source) => source.name)).toEqual([
      'child',
      'z_parent',
      'base',
      'a_parent',
    ]);
    expect(resolvePermission(sources, 'cms.audit.view')).toBe(false);
  });

  it('fails closed when an assigned group hierarchy contains a cycle', () => {
    const first = group('first', 10, {});
    const second = group('second', 5, {}, [first]);
    first.parents = [second];
    expect(() =>
      collectSources([{ group: first, expiresAt: null }], null, now),
    ).toThrow('Permission group inheritance cycle detected');
  });

  it('ignores expired memberships and always includes the default group once', () => {
    const defaultGroup = group('default', 0, { 'cms.audit.view': true });
    const sources = collectSources(
      [
        {
          group: group('admin', 100, { '*': true }),
          expiresAt: new Date('2029-12-31T23:59:59Z'),
        },
        { group: defaultGroup, expiresAt: null },
      ],
      defaultGroup,
      now,
    );
    expect(sources.map((source) => source.name)).toEqual(['default']);
    expect(resolvePermission(sources, 'cms.audit.view')).toBe(true);
    expect(resolvePermission(sources, 'cms.settings.manage')).toBe(false);
  });

  it('denies nodes outside the XDR catalog even under *', () => {
    expect(
      resolvePermission([group('admin', 100, { '*': true })], 'room.kick'),
    ).toBe(false);
  });

  it('denies when nobody has an opinion', () => {
    expect(resolvePermission([], 'cms.audit.view')).toBe(false);
  });
});
