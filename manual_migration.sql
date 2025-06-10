-- Manual migration to create invitation_tokens table
CREATE TABLE IF NOT EXISTS "invitation_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used_by_id" text
);

-- Add unique constraint on token
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_token_unique" UNIQUE("token");

-- Add foreign key constraints
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invitation_tokens" ADD CONSTRAINT "invitation_tokens_used_by_id_users_id_fk" FOREIGN KEY ("used_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
