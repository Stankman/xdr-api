import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UserController } from './user.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './services/users.service';
import { AppConfigModule } from 'src/config/app/app-config.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        AppConfigModule
    ],
    controllers: [
        UsersController,
        UserController
    ],
    providers: [
        UsersRepository,
        UsersService
    ],
    exports: [
        UsersService
    ]
})
export class UserModule {}
