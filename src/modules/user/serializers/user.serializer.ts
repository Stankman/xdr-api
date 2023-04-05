import { Expose } from 'class-transformer';
import { IUser } from '../interfaces/user.interface';
import { ModelEntitySerializer } from 'src/common/serializers/model.serializer';

export class UserSerializer extends ModelEntitySerializer implements IUser {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose({ groups: ['private'] })
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}