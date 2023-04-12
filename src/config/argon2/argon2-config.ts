import { registerAs } from "@nestjs/config";

export const Argon2Config = registerAs('argon2', () => ({
    memory_cost: process.env.ARGON2_MEMORY_COST,
    time_cost: process.env.ARGON2_TIME_COST,
    threads: process.env.ARGON2_THREADS
}));