import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

const sql = postgres(connectionString);
// const db = drizzle(sql);

async function createInvitationTokensTable() {
	try {
		console.log('Creating invitation_tokens table...');

		await sql`
			CREATE TABLE IF NOT EXISTS "invitation_tokens" (
				"id" text PRIMARY KEY NOT NULL,
				"token" text NOT NULL,
				"created_by_id" text NOT NULL,
				"created_at" timestamp with time zone DEFAULT now() NOT NULL,
				"expires_at" timestamp with time zone NOT NULL,
				"used_at" timestamp with time zone,
				"used_by_id" text
			)
		`;

		await sql`
			ALTER TABLE "invitation_tokens" 
			ADD CONSTRAINT IF NOT EXISTS "invitation_tokens_token_unique" 
			UNIQUE("token")
		`;

		await sql`
			ALTER TABLE "invitation_tokens" 
			ADD CONSTRAINT IF NOT EXISTS "invitation_tokens_created_by_id_users_id_fk" 
			FOREIGN KEY ("created_by_id") REFERENCES "users"("id") 
			ON DELETE no action ON UPDATE no action
		`;

		await sql`
			ALTER TABLE "invitation_tokens" 
			ADD CONSTRAINT IF NOT EXISTS "invitation_tokens_used_by_id_users_id_fk" 
			FOREIGN KEY ("used_by_id") REFERENCES "users"("id") 
			ON DELETE no action ON UPDATE no action
		`;

		console.log('✅ invitation_tokens table created successfully!');
	} catch (error) {
		console.error('❌ Error creating table:', error);
	} finally {
		await sql.end();
	}
}

createInvitationTokensTable();
