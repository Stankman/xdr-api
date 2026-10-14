import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import {
  TurboAdminMe,
  TurboCatalogTree,
  TurboIssueTicketRequest,
  TurboIssuedTicket,
  TurboPermissionCatalog,
  TurboPermissionCheck,
  TurboPlayerActionRequest,
  TurboPlayerDetail,
  TurboPlayerList,
  TurboRoomList,
  TurboTicketStatus,
} from './turbo.contracts';

@Injectable()
export class TurboAdminClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('TURBO_ADMIN_BASE_URL', '').replace(/\/+$/, '');
    this.timeoutMs = config.get<number>('TURBO_TIMEOUT_MS', 5000);
  }

  getMe(token: string): Promise<TurboAdminMe> {
    return this.request(token, '/api/me');
  }

  searchPlayers(
    token: string,
    query: { q?: string; by?: 'Name' | 'Id'; online?: boolean; page: number },
  ): Promise<TurboPlayerList> {
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.q) params.set('q', query.q);
    if (query.by) params.set('by', query.by);
    if (query.online !== undefined) params.set('online', String(query.online));
    return this.request(token, `/api/players/?${params}`);
  }

  getPlayer(token: string, playerId: number): Promise<TurboPlayerDetail> {
    return this.request(token, `/api/players/${playerId}`);
  }

  getTicketStatus(token: string, playerId: number): Promise<TurboTicketStatus> {
    return this.request(token, `/api/players/${playerId}/ticket`);
  }

  issueTicket(
    token: string,
    playerId: number,
    input: TurboIssueTicketRequest,
  ): Promise<TurboIssuedTicket> {
    return this.request(token, `/api/players/${playerId}/ticket`, 'POST', input);
  }

  revokeTicket(token: string, playerId: number): Promise<void> {
    return this.request(token, `/api/players/${playerId}/ticket`, 'DELETE', undefined, true);
  }

  applyPlayerAction(
    token: string,
    playerId: number,
    input: TurboPlayerActionRequest,
  ): Promise<unknown> {
    return this.request(token, `/api/players/${playerId}/actions`, 'POST', input);
  }

  searchRooms(
    token: string,
    query: { q?: string; by?: 'Name' | 'Id' | 'Owner'; page: number },
  ): Promise<TurboRoomList> {
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.q) params.set('q', query.q);
    if (query.by) params.set('by', query.by);
    return this.request(token, `/api/rooms/?${params}`);
  }

  getRoom(token: string, roomId: number): Promise<Record<string, unknown>> {
    return this.request(token, `/api/rooms/${roomId}`);
  }

  getCatalog(token: string): Promise<TurboCatalogTree> {
    return this.request(token, '/api/catalog/');
  }

  getPermissionCatalog(token: string): Promise<TurboPermissionCatalog> {
    return this.request(token, '/api/permissions/catalog');
  }

  checkPermission(token: string, playerId: number, node: string): Promise<TurboPermissionCheck> {
    const params = new URLSearchParams({ node });
    return this.request(token, `/api/permissions/players/${playerId}/check?${params}`);
  }

  async streamLive(token: string, response: Response): Promise<void> {
    const abort = new AbortController();
    response.once('close', () => abort.abort());
    const upstream = await this.fetchResponse(token, '/api/live', 'GET', undefined, abort.signal);
    if (!upstream.body) throw new BadGatewayException('Turbo returned an empty live stream.');

    response.status(upstream.status);
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('X-Accel-Buffering', 'no');
    try {
      await pipeline(Readable.from(upstream.body), response, { signal: abort.signal });
    } catch (error) {
      if (abort.signal.aborted) return;
      response.destroy(error instanceof Error ? error : new Error('Turbo live stream failed.'));
      throw error;
    }
  }

  private async request<T>(
    token: string,
    path: string,
    method = 'GET',
    body?: unknown,
    allowNoContent = false,
  ): Promise<T> {
    const response = await this.fetchResponse(token, path, method, body);
    if (response.status === 204 && allowNoContent) return undefined as T;
    let content: string;
    try {
      content = await response.text();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ServiceUnavailableException('Turbo Admin API response timed out.');
      }
      throw new BadGatewayException('Turbo Admin API response could not be read.');
    }
    if (!content) {
      throw new BadGatewayException('Turbo returned an empty response for an API request.');
    }
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new BadGatewayException('Turbo returned a non-JSON response for an API request.');
    }
  }

  private async fetchResponse(
    token: string,
    path: string,
    method: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<globalThis.Response> {
    if (!this.baseUrl) {
      throw new ServiceUnavailableException('Turbo Admin API is not configured.');
    }
    let response: globalThis.Response;
    const connectionTimeout = signal ? new AbortController() : undefined;
    const timeout = signal
      ? setTimeout(
          () => connectionTimeout?.abort(new DOMException('Turbo request timed out.', 'TimeoutError')),
          this.timeoutMs,
        )
      : undefined;
    try {
      response = await fetch(new URL(path, `${this.baseUrl}/`), {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal:
          signal && connectionTimeout
            ? AbortSignal.any([signal, connectionTimeout.signal])
            : AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ServiceUnavailableException('Turbo Admin API request timed out.');
      }
      if (error instanceof TypeError) {
        throw new ServiceUnavailableException('Turbo Admin API is unavailable.');
      }
      throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
    }

    if (!response.ok) {
      if (response.status === 401) throw new UnauthorizedException('Turbo Admin session is invalid.');
      if (response.status === 403) throw new ForbiddenException('Turbo denied this operation.');
      if (response.status === 404) throw new NotFoundException('Turbo resource was not found.');
      if (response.status === 400) {
        throw new BadRequestException('Turbo rejected the request (HTTP 400).');
      }
      if (response.status === 409) {
        throw new ConflictException('Turbo rejected the state change (HTTP 409).');
      }
      throw new BadGatewayException(`Turbo Admin API returned HTTP ${response.status}.`);
    }
    return response;
  }
}
