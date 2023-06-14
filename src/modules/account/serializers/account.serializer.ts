import { Exclude, Expose } from "class-transformer";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAccount } from "../interfaces/account.interface";
import { Role } from "src/modules/role/entities/role.entity";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";

export const defaultAccountGroupsForSerializing: string[] = [
  'account.timestamps', 'roles'
];

export const extendedAccountGroupsForSerializing: string[] = [
  ...defaultAccountGroupsForSerializing,
];

export const allAccountGroupsForSerializing: string[] = [
  ...extendedAccountGroupsForSerializing,
  'account.privacy',
];
export class AccountSerializer extends ModelEntitySerializer implements IAccount {
  id: number;

  email: string;
  
  @Expose({ groups: ['account.privacy'] })
  password: string;

  @Expose({ groups: ['account.timestamps'] })
  last_login: number;

  @Expose({ groups: ['account.privacy']})
  ip_current: string;
  
  @Expose({ groups: ['account.privacy']})
  ip_register: string;

  @Expose({ groups: ['account.timestamps'] })
  created_at: Date;
  
  @Exclude()
  updated_at: Date;

  avatars: Avatar[];

  activeAvatar: Avatar;
}