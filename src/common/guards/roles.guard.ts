import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/role-permission.decorator';
import { Account } from 'src/modules/account/entities/account.entity';
import { Permission } from 'src/modules/role/entities/permission.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { AccountGuardService } from 'src/modules/account/services/account-guard.service';
import { PermissionGuardService } from 'src/modules/role/services/permission-guard.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector : Reflector,
    private readonly accountGuardService : AccountGuardService,
    private readonly permissionGuardService : PermissionGuardService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRolePermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    return true;

    if(!requiredRolePermission) {
      return true;
    }

    const requiredPermission : Permission = await this.permissionGuardService.getPermissionByName(requiredRolePermission);

    if(!requiredRolePermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const loggedAccount : Account = await this.accountGuardService.getLoggedAccount(request);

    const role : Role = loggedAccount.active_avatar.rank.role;

    if(!role) {
      return false;
    }
    
    return role.permissions.some((p) => p.name === requiredPermission.name);
  }
}
