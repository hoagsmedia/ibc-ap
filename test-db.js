import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const { Client } = pg;

async function testConnection() {
	const client = new Client({
		connectionString: process.env.DATABASE_URL
	});

	try {
		await client.connect();
		console.log('✅ Connected to database successfully!');

		// Check if invitation_tokens table exists
		const result = await client.query(`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_schema = 'public' 
				AND table_name = 'invitation_tokens'
			);
		`);

		console.log('invitation_tokens table exists:', result.rows[0].exists);

		if (!result.rows[0].exists) {
			console.log('Creating invitation_tokens table...');
			await client.query(`
				CREATE TABLE "invitation_tokens" (
					"id" text PRIMARY KEY NOT NULL,
					"token" text NOT NULL UNIQUE,
					"created_by_id" text NOT NULL,
					"created_at" timestamp with time zone DEFAULT now() NOT NULL,
					"expires_at" timestamp with time zone NOT NULL,
					"used_at" timestamp with time zone,
					"used_by_id" text,
					CONSTRAINT "invitation_tokens_created_by_id_users_id_fk" 
						FOREIGN KEY ("created_by_id") REFERENCES "users"("id"),
					CONSTRAINT "invitation_tokens_used_by_id_users_id_fk" 
						FOREIGN KEY ("used_by_id") REFERENCES "users"("id")
				);
			`);
			console.log('✅ invitation_tokens table created!');
		}
	} catch (error) {
		console.error('❌ Database error:', error);
	} finally {
		await client.end();
	}
}

testConnection();
