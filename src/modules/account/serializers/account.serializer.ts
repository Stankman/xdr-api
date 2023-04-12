import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IAccount } from "../interfaces/account.interface";

export class AccountSerializer extends ModelEntitySerializer implements IAccount {
  id: number;

  email: string;
  
  password: string;

  last_login: number;

  ip_current: string;
  
  ip_register: string;

  created_at: Date;

  updated_at: Date;
}