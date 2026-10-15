import { DataSource } from 'typeorm';
import { XdrAcpAccess1792200000000 } from './1792200000000-XdrAcpAccess';

describe('XDR ACP access migration', () => {
  it('seeds ACP access for current ACP roles without overwriting explicit denials', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new XdrAcpAccess1792200000000().up(runner);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("name IN ('admin', 'content_editor')"),
      ['cms.acp.access'],
    );
    expect(query.mock.calls[0][0]).toContain(
      'ON DUPLICATE KEY UPDATE node = node',
    );
    expect(query.mock.calls[0][0]).not.toMatch(
      /CREATE TABLE|DELETE|UPDATE value|REFERENCES players/,
    );
  });

  it('does not delete potentially customized grants on revert', async () => {
    await expect(
      new XdrAcpAccess1792200000000().down(),
    ).resolves.toBeUndefined();
  });
});
