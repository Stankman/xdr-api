import { registerAs } from "@nestjs/config";

export const MySQLConfig = registerAs('mysql',() => ({
    host: process.env.MYSQL_ENV,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD
}));