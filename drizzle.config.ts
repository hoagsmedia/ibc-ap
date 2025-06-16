import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// console.log('Drizzle configuration loaded with DATABASE_URL:', process.env.DATABASE_URL_LOCAL);

export default defineConfig({
	// out: './drizzle',
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL! },
	verbose: true,
	strict: true
});
