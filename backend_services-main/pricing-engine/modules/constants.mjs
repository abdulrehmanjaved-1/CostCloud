import { isTrue } from './system.mjs';

export const logSQL = !process.env.LOG_SQL ? false : isTrue(process.env.LOG_SQL);
export const postgres = {
    ca: process.env.POSTGRES_CA,
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD || 'pgpassword',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    schema: process.env.POSTGRES_SCHEMA || 'public',
    ssl: !process.env.POSTGRES_SSL ? false : isTrue(process.env.POSTGRES_SSL),
    username: process.env.POSTGRES_USERNAME || 'postgres'
};