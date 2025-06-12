import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Use local database for development, production for production
const databaseUrl = process.env.DATABASE_URL_LOCAL!;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true,
	out: './migrations'
});
