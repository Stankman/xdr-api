import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AccountsService } from 'src/modules/account/services/accounts.service';
import { Account } from 'src/modules/account/entities/account.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector : Reflector,
    private readonly accountsService : AccountsService
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if(!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();

    const loggedAccount : Account = await this.accountsService.getLoggedAccount(request);

    if(loggedAccount) {
      //If logged Account has Permission return true, otherwise return false
      return true;
    }

    return false;
  }
}
