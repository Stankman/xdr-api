import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()

/**
 * Service dealing with mysql Database config based operations.
 *
 * @class MySQLConfigService
 */
export class MySQLConfigService {

    constructor(private configService : ConfigService) {}

    public get host() : string {
        return this.configService.get<string>('mysql.host');
    }

    public get port() : number {
        return this.configService.get<number>('mysql.port');
    }

    public get database() : string {
        return this.configService.get<string>('mysql.database');
    }

    public get username() : string {
        return this.configService.get<string>('mysql.username');
    }

    public get password() : string {
        return this.configService.get<string>('mysql.password');
    }
}