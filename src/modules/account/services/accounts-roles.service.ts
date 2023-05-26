import { HttpException, Injectable } from '@nestjs/common';
import { AccountsRolesRepository } from '../repositories/accounts-roles.repository';
import { RolesService } from '../../role/services/roles.service';
import { Role } from 'src/modules/role/entities/role.entity';
import { AccountsRoles } from '../entities/accounts-roles.entity';
import { AccountService } from './accounts.service';
import { AssignRoleDTO } from '../dtos/assign-role.dto';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountsRolesService {
    constructor(
        private readonly repository : AccountsRolesRepository,
        private readonly rolesService : RolesService,
        private readonly accountsService : AccountService

    ) {}

    public async getAccounts(roleId : number) : Promise<any> {
        let role : Role = await this.rolesService.getRole(roleId);

        let accountsRoles : AccountsRoles[]  = await this.repository.findBy({
            role_id: role.id
        });

        let accountIds : number[] = [];

        accountsRoles.forEach(accountRole => {
            accountIds.push(accountRole.account_id);
        });

        return this.accountsService.getAccountsByIds(accountIds);
    }

    public async assignRole(assignRoleDTO : AssignRoleDTO) {
        let role : Role = await this.rolesService.getRole(assignRoleDTO.role_id);

        let account : Account = await this.accountsService.getAccountById(assignRoleDTO.account_id);

        let accountWithRole: AccountsRoles = await this.repository.findOneBy({
            account_id: account.id
        });

        if(accountWithRole) {
            return 'Already Exists';
        }

        return this.repository.save(this.getNewAccountsRoles(assignRoleDTO));
    }

    private getNewAccountsRoles(assignRoleDTO : AssignRoleDTO) : AccountsRoles {
        let accountsRoles : AccountsRoles = new AccountsRoles();

        accountsRoles.role_id = assignRoleDTO.role_id;
        accountsRoles.account_id = assignRoleDTO.account_id;
        accountsRoles.created_at = new Date();

        return accountsRoles;
    }
}
