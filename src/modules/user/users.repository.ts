import { User } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common/decorators';
import { UserSerializer } from './serializers/user.serializer';
import { ModelRepository } from '../shared/model.repository';

@Injectable()
export class UserRepository extends ModelRepository<User, UserSerializer> {
    constructor(private dataSource : DataSource) {
        super(User, dataSource.createEntityManager());
    }
}