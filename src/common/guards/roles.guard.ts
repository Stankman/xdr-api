import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/role-permission.decorator';
import { AccountService } from 'src/modules/account/services/accounts.service';
import { Account } from 'src/modules/account/entities/account.entity';
import { PermissionService } from 'src/modules/role/services/permission.service';
import { Permission } from 'src/modules/role/entities/permission.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector : Reflector,
    private readonly accountService : AccountService,
    private readonly permissionService : PermissionService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    return true; //TODO REMOVE THIS

    if(!requiredPermission) {
      return true;
    }

    const requiredRolePermission : Permission = await this.permissionService.getPermissionByName(requiredPermission);

    if(!requiredRolePermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const loggedAccount : Account = await this.accountService.getLoggedAccount(request);

    return true; //TODO this
  }
}
