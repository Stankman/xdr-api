import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { AccountService } from 'src/modules/account/services/accounts.service';
import { Account } from 'src/modules/account/entities/account.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { RolePermissionsService } from 'src/modules/role/services/role-permissions.service';
import { RolePermission } from 'src/modules/role/entities/role-permission.entity';
import { RolesPermissionsService } from 'src/modules/role/services/roles-permissions.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector : Reflector,
    private readonly accountsService : AccountService,
    private readonly rolePermissionsService : RolePermissionsService,
    private readonly rolesPermissionsService : RolesPermissionsService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if(!requiredPermission) {
      return true;
    }

    const requiredRolePermission : RolePermission = await this.rolePermissionsService.getRolePermissionByName(requiredPermission);

    if(!requiredRolePermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const loggedAccount : Account = await this.accountsService.getLoggedAccount(request);

    return false;
  }
}
