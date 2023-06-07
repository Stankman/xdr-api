import { registerAs } from "@nestjs/config";

export const RconConfig = registerAs('rcon',() => ({
    host: process.env.RCON_HOST,
    port: process.env.RCON_PORT
}));