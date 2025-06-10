import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use local Postgres for development, Neon for production
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const connectionString = isDev
	? process.env.DATABASE_URL_LOCAL // e.g. 'postgres://user:pass@localhost:5432/ibc'
	: process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error(
		isDev
			? 'DATABASE_URL_LOCAL is not set (check your .env file)'
			: 'DATABASE_URL is not set (check your .env file)'
	);
}

export const client = postgres(connectionString!);
export const db = drizzle(client, { schema });
