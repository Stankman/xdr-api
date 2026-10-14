import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, In, Repository } from 'typeorm';
import { AuditLogService } from '../../audit/audit-log.service';
import { XdrSetting } from '../entities/xdr-setting.entity';
import {
  REGISTRATION_AVATAR_MAX_LENGTH,
  REGISTRATION_DEFAULT_AVATAR_KEY,
} from '../registration-defaults';

export const PUBLIC_WEBSITE_SETTING_KEYS = [
  'public.site_name',
  'public.site_description',
  'public.support_url',
  'public.maintenance_message',
] as const;

export const MANAGEABLE_WEBSITE_SETTING_KEYS = [
  ...PUBLIC_WEBSITE_SETTING_KEYS,
  REGISTRATION_DEFAULT_AVATAR_KEY,
] as const;

interface SettingActor {
  accountId: number;
  playerId: number | null;
  requestId?: string;
}

@Injectable()
export class WebsiteSettingsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audit: AuditLogService,
    @InjectRepository(XdrSetting)
    private readonly settings: Repository<XdrSetting>,
  ) {}

  async publicSettings(): Promise<Record<string, string>> {
    const rows = await this.settings.find({
      where: { key: In([...PUBLIC_WEBSITE_SETTING_KEYS]) },
      select: { key: true, value: true },
      order: { key: 'ASC' },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  async listManageable(): Promise<XdrSetting[]> {
    return this.settings.find({
      where: { key: In([...MANAGEABLE_WEBSITE_SETTING_KEYS]) },
      order: { key: 'ASC' },
    });
  }

  update(key: string, value: string, actor: SettingActor): Promise<XdrSetting> {
    this.assertManageableKey(key);
    if (key === REGISTRATION_DEFAULT_AVATAR_KEY) {
      value = value.trim();
      if (!value || value.length > REGISTRATION_AVATAR_MAX_LENGTH) {
        throw new BadRequestException(
          `Registration avatar must contain between 1 and ${REGISTRATION_AVATAR_MAX_LENGTH} characters.`,
        );
      }
    }
    return this.write('website_setting.update', key, actor, async (manager) => {
      const repository = manager.getRepository(XdrSetting);
      const setting = await repository.findOne({ where: { key } });
      return setting
        ? repository.save({ ...setting, value })
        : repository.save(repository.create({ key, value }));
    });
  }

  remove(key: string, actor: SettingActor): Promise<void> {
    this.assertManageableKey(key);
    if (key === REGISTRATION_DEFAULT_AVATAR_KEY) {
      throw new BadRequestException(
        'The default registration avatar cannot be removed.',
      );
    }
    return this.write('website_setting.delete', key, actor, async (manager) => {
      const repository = manager.getRepository(XdrSetting);
      const result = await repository.delete({ key });
      if (!result.affected)
        throw new NotFoundException('Website setting was not found.');
    });
  }

  private async write<T>(
    action: string,
    key: string,
    actor: SettingActor,
    operation: (manager: import('typeorm').EntityManager) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const result = await operation(manager);
        await this.audit.record(
          {
            actorAccountId: actor.accountId,
            actorPlayerId: actor.playerId,
            action,
            targetType: 'website_setting',
            targetId: key,
            result: 'success',
            requestId: actor.requestId || randomUUID(),
            details: { key },
          },
          manager,
        );
        return result;
      });
    } catch (error) {
      await this.audit.record({
        actorAccountId: actor.accountId,
        actorPlayerId: actor.playerId,
        action,
        targetType: 'website_setting',
        targetId: key,
        result: 'failure',
        requestId: actor.requestId || randomUUID(),
        details: {
          key,
          errorType: error instanceof Error ? error.name : 'UnknownError',
        },
      });
      throw error;
    }
  }

  private assertManageableKey(key: string): void {
    if (!(MANAGEABLE_WEBSITE_SETTING_KEYS as readonly string[]).includes(key)) {
      throw new BadRequestException(
        'Only explicitly allowlisted website settings can be managed.',
      );
    }
  }
}
