import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAccountsRoles } from "../interfaces/accounts-roles.interface";
import { Role } from "src/modules/role/entities/role.entity";
import { Account } from "../entities/account.entity";

export class AccountsRolesSerializer extends ModelEntitySerializer implements IAccountsRoles {
    id: number;
    account_id: number;
    role_id: number;
    created_at: Date;
    accounts: Account[];
    roles: Role[];
} 