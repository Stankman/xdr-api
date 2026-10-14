import {
  BadGatewayException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TurboAdminClient } from './turbo-admin.client';
import { TurboPermissionService } from './turbo-permission.service';

describe('Turbo permission validation', () => {
  it('denies an unregistered Turbo permission node', async () => {
    const client = {
      checkPermission: jest.fn().mockResolvedValue({
        node: 'cms.articles.manage',
        isRegistered: false,
        granted: false,
      }),
    } as unknown as TurboAdminClient;

    await expect(
      new TurboPermissionService(client).require('individual-session', 9, 'cms.articles.manage'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies a permission response for a different node', async () => {
    const client = {
      checkPermission: jest.fn().mockResolvedValue({
        node: 'admin.panel',
        isRegistered: true,
        granted: true,
      }),
    } as unknown as TurboAdminClient;

    await expect(
      new TurboPermissionService(client).require('individual-session', 9, 'cms.articles.manage'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns a clear unavailable error when Turbo is not configured', async () => {
    const config = {
      get: (_key: string, defaultValue: unknown) => defaultValue,
    } as unknown as ConfigService;
    const client = new TurboAdminClient(config);

    await expect(client.searchPlayers('individual-session', { page: 1 })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('maps a failed Turbo mutation to unavailable without retrying', async () => {
    const config = {
      get: (key: string, defaultValue: unknown) =>
        key === 'TURBO_ADMIN_BASE_URL' ? 'http://127.0.0.1:8090' : defaultValue,
    } as unknown as ConfigService;
    const client = new TurboAdminClient(config);
    const fetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));

    try {
      await expect(
        client.applyPlayerAction('individual-session', 12, { action: 'ban' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      fetch.mockRestore();
    }
  });

  it('rejects an empty success response when JSON is expected', async () => {
    const config = {
      get: (key: string, defaultValue: unknown) =>
        key === 'TURBO_ADMIN_BASE_URL' ? 'http://127.0.0.1:8090' : defaultValue,
    } as unknown as ConfigService;
    const client = new TurboAdminClient(config);
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));

    try {
      await expect(client.getMe('individual-session')).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    } finally {
      fetch.mockRestore();
    }
  });

  it('maps an upstream body timeout to service unavailable', async () => {
    const config = {
      get: (key: string, defaultValue: unknown) =>
        key === 'TURBO_ADMIN_BASE_URL' ? 'http://127.0.0.1:8090' : defaultValue,
    } as unknown as ConfigService;
    const client = new TurboAdminClient(config);
    const response = new Response();
    jest
      .spyOn(response, 'text')
      .mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    try {
      await expect(client.getMe('individual-session')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    } finally {
      fetch.mockRestore();
    }
  });
});
