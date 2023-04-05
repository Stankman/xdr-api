import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { MySQLConfigModule } from "src/config/mysql/mysql-config.module";
import { MySQLConfigService } from "src/config/mysql/mysql-config.service";
import { DatabaseType } from "typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [MySQLConfigModule],
            useFactory: async(mySQLConfigService : MySQLConfigService) => ({
                type: 'mysql' as DatabaseType,
                host: mySQLConfigService.host,
                port: mySQLConfigService.port,
                database: mySQLConfigService.database,
                username: mySQLConfigService.username,
                password: mySQLConfigService.password,
                entities: [__dirname + '/../../../**/*.entity{.ts,.js}']
            }),
            inject: [MySQLConfigService]
        } as TypeOrmModuleAsyncOptions)
    ]
})
export class MySQLProviderModule {}