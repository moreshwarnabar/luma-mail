ALTER TABLE "mail_account" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "mail_account" DROP COLUMN "is_default";