import { DataSource } from 'typeorm';
import {
  ACCOUNT_MAX_AVATARS_KEY,
  DEFAULT_ACCOUNT_MAX_AVATARS,
  DEFAULT_REGISTRATION_MAX_ACCOUNTS_PER_IP,
  REGISTRATION_MAX_ACCOUNTS_PER_IP_KEY,
} from '../../../modules/setting/registration-defaults';
import { RegistrationLimits1792300000000 } from './1792300000000-RegistrationLimits';

describe('Registration limits migration', () => {
  it('seeds default limits without overwriting configured values and indexes registration IPs', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new RegistrationLimits1792300000000().up(runner);
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO xdr_settings'),
      [
        REGISTRATION_MAX_ACCOUNTS_PER_IP_KEY,
        String(DEFAULT_REGISTRATION_MAX_ACCOUNTS_PER_IP),
        ACCOUNT_MAX_AVATARS_KEY,
        String(DEFAULT_ACCOUNT_MAX_AVATARS),
      ],
    );
    expect(query.mock.calls[0][0]).toContain(
      'ON DUPLICATE KEY UPDATE `key` = `key`',
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      'CREATE INDEX IDX_xdr_accounts_ip_register ON xdr_accounts (ip_register(45))',
    );
  });

  it('removes only the performance index when reverted', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new RegistrationLimits1792300000000().down(runner);
    expect(query).toHaveBeenCalledWith(
      'DROP INDEX IDX_xdr_accounts_ip_register ON xdr_accounts',
    );
  });
});
