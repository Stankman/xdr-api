import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AuditLogService } from '../../audit/audit-log.service';
import { XdrSetting } from '../entities/xdr-setting.entity';
import {
  DEFAULT_REGISTRATION_AVATAR,
  REGISTRATION_DEFAULT_AVATAR_KEY,
} from '../registration-defaults';
import {
  MANAGEABLE_WEBSITE_SETTING_KEYS,
  PUBLIC_WEBSITE_SETTING_KEYS,
  WebsiteSettingsService,
} from './website-settings.service';

describe('WebsiteSettingsService registration defaults', () => {
  const actor = { accountId: 1, playerId: 2, requestId: 'settings-test' };
  const manager = new EntityManager(new DataSource({ type: 'mysql' }));
  const repository = Object.assign(new Repository(XdrSetting, manager), {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });
  const transaction = jest.fn();
  const audit = { record: jest.fn() };
  let service: WebsiteSettingsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.spyOn(manager, 'getRepository').mockReturnValue(repository);
    transaction.mockImplementation(
      (operation: (manager: EntityManager) => unknown) => operation(manager),
    );
    repository.create.mockImplementation((setting: XdrSetting) => setting);
    repository.save.mockImplementation(async (setting: XdrSetting) => setting);
    const module = await Test.createTestingModule({
      providers: [
        WebsiteSettingsService,
        { provide: DataSource, useValue: { transaction } },
        { provide: AuditLogService, useValue: audit },
        { provide: getRepositoryToken(XdrSetting), useValue: repository },
      ],
    }).compile();
    service = module.get(WebsiteSettingsService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('excludes registration defaults from the public query', async () => {
    repository.find.mockResolvedValue([
      { key: 'public.site_name', value: 'XDR' },
    ]);
    expect(await service.publicSettings()).toEqual({
      'public.site_name': 'XDR',
    });
    expect(repository.find).toHaveBeenCalledWith({
      where: { key: In([...PUBLIC_WEBSITE_SETTING_KEYS]) },
      select: { key: true, value: true },
      order: { key: 'ASC' },
    });
    expect(PUBLIC_WEBSITE_SETTING_KEYS).not.toContain(
      REGISTRATION_DEFAULT_AVATAR_KEY,
    );
  });

  it('includes the registration avatar in the manageable query', async () => {
    repository.find.mockResolvedValue([]);
    await service.listManageable();
    expect(repository.find).toHaveBeenCalledWith({
      where: { key: In([...MANAGEABLE_WEBSITE_SETTING_KEYS]) },
      order: { key: 'ASC' },
    });
    expect(MANAGEABLE_WEBSITE_SETTING_KEYS).toContain(
      REGISTRATION_DEFAULT_AVATAR_KEY,
    );
  });

  it('trims, saves and audits a registration avatar without recording its value', async () => {
    repository.findOne.mockResolvedValue(null);
    const setting = await service.update(
      REGISTRATION_DEFAULT_AVATAR_KEY,
      `  ${DEFAULT_REGISTRATION_AVATAR}  `,
      actor,
    );
    expect(setting).toEqual({
      key: REGISTRATION_DEFAULT_AVATAR_KEY,
      value: DEFAULT_REGISTRATION_AVATAR,
    });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'website_setting.update',
        result: 'success',
        details: { key: REGISTRATION_DEFAULT_AVATAR_KEY },
      }),
      manager,
    );
  });

  it.each(['', '   ', 'a'.repeat(280)])(
    'rejects an invalid registration figure',
    (value) => {
      expect(() =>
        service.update(REGISTRATION_DEFAULT_AVATAR_KEY, value, actor),
      ).toThrow(BadRequestException);
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it('accepts a figure at the 279-character limit', async () => {
    repository.findOne.mockResolvedValue(null);
    await service.update(
      REGISTRATION_DEFAULT_AVATAR_KEY,
      'a'.repeat(279),
      actor,
    );
    expect(repository.save).toHaveBeenCalledWith({
      key: REGISTRATION_DEFAULT_AVATAR_KEY,
      value: 'a'.repeat(279),
    });
  });

  it('does not permit removing the required registration avatar', () => {
    expect(() =>
      service.remove(REGISTRATION_DEFAULT_AVATAR_KEY, actor),
    ).toThrow(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('preserves public setting values and deletion behavior', async () => {
    repository.findOne.mockResolvedValue(null);
    await service.update('public.site_name', '  XDR  ', actor);
    expect(repository.save).toHaveBeenCalledWith({
      key: 'public.site_name',
      value: '  XDR  ',
    });
    repository.delete.mockResolvedValue({ affected: 1 });
    await service.remove('public.site_name', actor);
    expect(repository.delete).toHaveBeenCalledWith({ key: 'public.site_name' });
  });

  it('rejects arbitrary setting keys and an unregistered avatar alias', () => {
    for (const key of ['registration.avatar', 'private.secret']) {
      expect(() => service.update(key, 'value', actor)).toThrow(
        BadRequestException,
      );
      expect(() => service.remove(key, actor)).toThrow(BadRequestException);
    }
    expect(transaction).not.toHaveBeenCalled();
  });
});
