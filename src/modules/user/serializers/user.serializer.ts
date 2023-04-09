import { Expose } from "class-transformer";
import { IUser } from "../interfaces/user.interface";
import { ModelEntitySerializer } from "src/common/serializers/model.serializer";

export const defaultUserGroupsForSerializing: string[] = ['user.timestamps'];

export const extendedUserGroupsForSerializing: string[] = [
  ...defaultUserGroupsForSerializing,
];

export const allUserGroupsForSerializing: string[] = [
  ...extendedUserGroupsForSerializing,
  'user.password',
];
export class UserSerializer extends ModelEntitySerializer implements IUser {
  
  id: number;
  
  username : string;

  email: string;
  
  @Expose({ groups: ['user.password'] })
  password: string;

  ip_current: string;
  
  ip_register: string;

  @Expose({ groups: ['user.timestamps'] })
  createdAt: Date;
  
  @Expose({ groups: ['user.timestamps'] })
  updatedAt: Date;
}