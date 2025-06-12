import { defineConfig } from 'drizzle-kit';

import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL!;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true,
	out: './migrations'
});
