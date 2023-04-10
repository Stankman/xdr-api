import { registerAs } from "@nestjs/config";

export const TokenConfig = registerAs('token', () => ({
    issuer: process.env.TOKEN_ISSUER,
    duration: process.env.TOKEN_DURATION,
    secret: process.env.TOKEN_SECRET
}));