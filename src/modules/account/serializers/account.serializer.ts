import { Expose } from "class-transformer";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAccount } from "../interfaces/account.interface";

export const defaultAccountGroupsForSerializing: string[] = ['user.timestamps'];

export const extendedAccountGroupsForSerializing: string[] = [
  ...defaultAccountGroupsForSerializing,
];

export const allAccountGroupsForSerializing: string[] = [
  ...extendedAccountGroupsForSerializing,
  'account.password',
];
export class AccountSerializer extends ModelEntitySerializer implements IAccount {
  
  id: number;

  email: string;
  
  @Expose({ groups: ['account.password'] })
  password: string;

  ip_current: string;
  
  ip_register: string;

  @Expose({ groups: ['user.timestamps'] })
  created_at: Date;
  
  @Expose({ groups: ['user.timestamps'] })
  updated_at: Date;
}