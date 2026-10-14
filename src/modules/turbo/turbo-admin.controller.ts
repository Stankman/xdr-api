import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TurboAdminGuard } from '../../common/guards/turbo-admin.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { BoundedPagePipe } from '../../common/pipes/bounded-page.pipe';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { IssueTicketDto } from './dtos/issue-ticket.dto';
import { PlayerActionDto } from './dtos/player-action.dto';
import { TurboAdminClient } from './turbo-admin.client';
import { AuditLogService } from '../audit/audit-log.service';
import { randomUUID } from 'crypto';

@ApiTags('Turbo Admin integration')
@ApiBearerAuth()
@ApiSecurity('TurboAdminToken')
@ApiHeader({
  name: 'X-Turbo-Admin-Token',
  description: 'Individual Turbo Admin passkey session token; separate from the XDR JWT.',
  required: true,
})
@UseGuards(AuthGuard, TurboAdminGuard)
@Controller('turbo')
export class TurboAdminController {
  constructor(
    private readonly turbo: TurboAdminClient,
    private readonly audit: AuditLogService,
  ) {}

  @Get('admin/me')
  me(@Req() request: AuthenticatedRequest) {
    if (!request.turbo_admin_identity) {
      throw new UnauthorizedException('Turbo Admin identity is required.');
    }
    return request.turbo_admin_identity;
  }

  @Get('players')
  @ApiQuery({ name: 'q', required: false, maxLength: 64 })
  @ApiQuery({ name: 'by', required: false, enum: ['Name', 'Id'] })
  @ApiQuery({ name: 'online', required: false, type: Boolean })
  players(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('by') by?: 'Name' | 'Id',
    @Query('online') online?: string,
    @Query('page', BoundedPagePipe) page = 1,
  ) {
    if (q && q.length > 64) {
      throw new BadRequestException('Player search must be at most 64 characters.');
    }
    if (by && by !== 'Name' && by !== 'Id') {
      throw new BadRequestException('Unsupported player search mode.');
    }
    if (online !== undefined && online !== 'true' && online !== 'false') {
      throw new BadRequestException('online must be true or false.');
    }
    return this.turbo.searchPlayers(this.turboToken(request), {
      q,
      by,
      online: online === undefined ? undefined : online === 'true',
      page,
    });
  }

  @Get('players/:playerId')
  player(
    @Req() request: AuthenticatedRequest,
    @Param('playerId', PositiveIntPipe) playerId: number,
  ) {
    return this.turbo.getPlayer(this.turboToken(request), playerId);
  }

  @Post('players/:playerId/actions')
  playerAction(
    @Req() request: AuthenticatedRequest,
    @Param('playerId', PositiveIntPipe) playerId: number,
    @Body() input: PlayerActionDto,
  ) {
    return this.auditedMutation(
      request,
      `turbo.player_action.${input.action}`,
      'player',
      String(playerId),
      { action: input.action },
      () => this.turbo.applyPlayerAction(this.turboToken(request), playerId, input),
    );
  }

  @Get('players/:playerId/ticket')
  ticketStatus(
    @Req() request: AuthenticatedRequest,
    @Param('playerId', PositiveIntPipe) playerId: number,
  ) {
    return this.turbo.getTicketStatus(this.turboToken(request), playerId);
  }

  @Post('players/:playerId/ticket')
  issueTicket(
    @Req() request: AuthenticatedRequest,
    @Param('playerId', PositiveIntPipe) playerId: number,
    @Body() input: IssueTicketDto,
  ) {
    return this.auditedMutation(
      request,
      'turbo.login_ticket.issue',
      'player',
      String(playerId),
      { reusable: input.reusable },
      () =>
        this.turbo.issueTicket(this.turboToken(request), playerId, {
          lifetimeMinutes: input.lifetimeMinutes ?? null,
          reusable: input.reusable,
        }),
    );
  }

  @Delete('players/:playerId/ticket')
  revokeTicket(
    @Req() request: AuthenticatedRequest,
    @Param('playerId', PositiveIntPipe) playerId: number,
  ) {
    return this.auditedMutation(
      request,
      'turbo.login_ticket.revoke',
      'player',
      String(playerId),
      {},
      () => this.turbo.revokeTicket(this.turboToken(request), playerId),
    );
  }

  @Get('rooms')
  rooms(
    @Req() request: AuthenticatedRequest,
    @Query('q') q?: string,
    @Query('by') by?: 'Name' | 'Id' | 'Owner',
    @Query('page', BoundedPagePipe) page = 1,
  ) {
    if (q && q.length > 64) {
      throw new BadRequestException('Room search must be at most 64 characters.');
    }
    if (by && !['Name', 'Id', 'Owner'].includes(by)) {
      throw new BadRequestException('Unsupported room search mode.');
    }
    return this.turbo.searchRooms(this.turboToken(request), { q, by, page });
  }

  @Get('rooms/:roomId')
  room(
    @Req() request: AuthenticatedRequest,
    @Param('roomId', PositiveIntPipe) roomId: number,
  ) {
    return this.turbo.getRoom(this.turboToken(request), roomId);
  }

  @Get('catalog')
  catalog(@Req() request: AuthenticatedRequest) {
    return this.turbo.getCatalog(this.turboToken(request));
  }

  @Get('permissions/catalog')
  permissionCatalog(@Req() request: AuthenticatedRequest) {
    return this.turbo.getPermissionCatalog(this.turboToken(request));
  }

  @Get('permissions/players/:playerId/check')
  @ApiQuery({ name: 'node', required: true, maxLength: 200 })
  checkPermission(
    @Req() request: AuthenticatedRequest,
    @Param('playerId', PositiveIntPipe) playerId: number,
    @Query('node') node: string,
  ) {
    if (!node || node.length > 200) {
      throw new BadRequestException('Permission node must be 1-200 characters.');
    }
    return this.turbo.checkPermission(this.turboToken(request), playerId, node);
  }

  @Get('live')
  live(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ): Promise<void> {
    return this.turbo.streamLive(this.turboToken(request), response);
  }

  private turboToken(request: AuthenticatedRequest): string {
    if (!request.turbo_admin_token) {
      throw new UnauthorizedException('Turbo Admin identity is required.');
    }
    return request.turbo_admin_token;
  }

  private async auditedMutation<T>(
    request: AuthenticatedRequest,
    action: string,
    targetType: string,
    targetId: string,
    details: Record<string, string | number | boolean | null>,
    operation: () => Promise<T>,
  ): Promise<T> {
    const actorPlayerId = request.turbo_admin_player_id;
    if (!actorPlayerId) throw new ForbiddenException('Turbo Admin identity is required.');

    let result: T;
    try {
      result = await operation();
    } catch (error) {
      await this.audit.record({
        actorAccountId: request.xdr_uid,
        actorPlayerId,
        action,
        targetType,
        targetId,
        result: 'failure',
        requestId: request.requestId || randomUUID(),
        details: { ...details, errorType: error instanceof Error ? error.name : 'UnknownError' },
      });
      throw error;
    }

    try {
      await this.audit.record({
        actorAccountId: request.xdr_uid,
        actorPlayerId,
        action,
        targetType,
        targetId,
        result: 'success',
        requestId: request.requestId || randomUUID(),
        details,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Turbo completed the operation but XDR audit logging failed. Check Turbo Admin audit before retrying.',
        { cause: error },
      );
    }
    return result;
  }
}
