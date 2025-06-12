import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// // Use local database for development, production for production
// const isDev = process.env.NODE_ENV !== 'production';
// const databaseUrl = isDev ? process.env.DATABASE_URL_LOCAL : process.env.DATABASE_URL;

// if (!databaseUrl) {
// 	throw new Error(
// 		isDev
// 			? 'DATABASE_URL_LOCAL is not set (check your .env file)'
// 			: 'DATABASE_URL is not set (check your .env file)'
// 	);
// }

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL_LOCAL! },
	verbose: true,
	strict: true
});
