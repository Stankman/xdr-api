import { DataSource } from 'typeorm';
import {
  DEFAULT_REGISTRATION_AVATAR,
  REGISTRATION_DEFAULT_AVATAR_KEY,
} from '../../../modules/setting/registration-defaults';
import { RegistrationDefaultAvatar1791940000000 } from './1791940000000-RegistrationDefaultAvatar';

describe('Registration default avatar migration', () => {
  it('seeds only XDR settings without overwriting an existing value', async () => {
    const runner = new DataSource({ type: 'mysql' }).createQueryRunner();
    const query = jest.spyOn(runner, 'query').mockResolvedValue(undefined);
    await new RegistrationDefaultAvatar1791940000000().up(runner);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO xdr_settings'),
      [REGISTRATION_DEFAULT_AVATAR_KEY, DEFAULT_REGISTRATION_AVATAR],
    );
    expect(query.mock.calls[0][0]).toContain(
      'ON DUPLICATE KEY UPDATE `key` = `key`',
    );
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('retains configuration when reverting the seed', async () => {
    await expect(
      new RegistrationDefaultAvatar1791940000000().down(),
    ).resolves.toBeUndefined();
  });
});
