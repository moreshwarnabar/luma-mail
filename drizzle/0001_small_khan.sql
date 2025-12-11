-- Drop foreign key constraints that reference mail_account.id
ALTER TABLE "email_address" DROP CONSTRAINT IF EXISTS "email_address_account_id_mail_account_id_fk";--> statement-breakpoint
ALTER TABLE "thread" DROP CONSTRAINT IF EXISTS "thread_mail_account_id_mail_account_id_fk";--> statement-breakpoint

-- Convert mail_account.id from text to uuid
-- Note: This generates new UUIDs. If you have existing data, you'll need a more complex migration
ALTER TABLE "mail_account" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "mail_account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

-- Convert referencing columns from text to uuid
-- Note: If tables have data, foreign key relationships will be broken. Consider clearing tables first.
ALTER TABLE "email_address" ALTER COLUMN "account_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "mail_account_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint

-- Re-add foreign key constraints
ALTER TABLE "email_address" ADD CONSTRAINT "email_address_account_id_mail_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_mail_account_id_mail_account_id_fk" FOREIGN KEY ("mail_account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;