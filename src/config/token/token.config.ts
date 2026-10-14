import { registerAs } from "@nestjs/config";
import { randomBytes } from "crypto";

const processDevelopmentSecret = randomBytes(48).toString('hex');

function getSecret(): string {
    if (process.env.TOKEN_SECRET) return process.env.TOKEN_SECRET;
    if (process.env.APP_ENV === 'production') {
        throw new Error('TOKEN_SECRET must be configured in production.');
    }
    return processDevelopmentSecret;
}

export const TokenConfig = registerAs('token', () => ({
    issuer: process.env.TOKEN_ISSUER,
    duration: process.env.TOKEN_DURATION,
    secret: getSecret()
}));