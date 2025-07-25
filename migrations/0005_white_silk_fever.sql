ALTER TABLE "users" ALTER COLUMN "dops" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "dops" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dops_date" date;