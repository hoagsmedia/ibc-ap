import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL! },
	verbose: true,
	strict: true
});
