import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env.local for development
dotenv.config({ path: '.env.local' });

const isDev = process.env.NODE_ENV === 'development';
const databaseUrl = isDev ? process.env.DATABASE_URL_LOCAL : process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		isDev ? 'DATABASE_URL_LOCAL is not set (check your .env.local)' : 'DATABASE_URL is not set'
	);
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true
});
