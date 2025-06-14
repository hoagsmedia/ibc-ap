import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// // Use local Postgres for development, Neon for production
// const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
// const connectionString = isDev
// 	? process.env.DATABASE_URL_LOCAL // e.g. 'postgres://user:pass@localhost:5432/ibc'
// 	: process.env.DATABASE_URL;

// if (!connectionString) {
// 	throw new Error(
// 		isDev
// 			? 'DATABASE_URL_LOCAL is not set (check your .env.local)'
// 			: 'DATABASE_URL is not set (check your environment variables)'
// 	);
// }

export const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
