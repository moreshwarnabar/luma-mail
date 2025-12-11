-- Drop foreign key constraints that reference columns being converted
ALTER TABLE "email" DROP CONSTRAINT IF EXISTS "email_thread_id_thread_id_fk";--> statement-breakpoint
ALTER TABLE "email" DROP CONSTRAINT IF EXISTS "email_from_id_email_address_id_fk";--> statement-breakpoint
ALTER TABLE "email_address" DROP CONSTRAINT IF EXISTS "email_address_account_id_mail_account_id_fk";--> statement-breakpoint
ALTER TABLE "email_attachments" DROP CONSTRAINT IF EXISTS "email_attachments_email_id_email_id_fk";--> statement-breakpoint
ALTER TABLE "email_bcc_recipients" DROP CONSTRAINT IF EXISTS "email_bcc_recipients_email_id_email_id_fk";--> statement-breakpoint
ALTER TABLE "email_bcc_recipients" DROP CONSTRAINT IF EXISTS "email_bcc_recipients_email_address_id_email_address_id_fk";--> statement-breakpoint
ALTER TABLE "email_cc_recipients" DROP CONSTRAINT IF EXISTS "email_cc_recipients_email_id_email_id_fk";--> statement-breakpoint
ALTER TABLE "email_cc_recipients" DROP CONSTRAINT IF EXISTS "email_cc_recipients_email_address_id_email_address_id_fk";--> statement-breakpoint
ALTER TABLE "email_reply_to_recipients" DROP CONSTRAINT IF EXISTS "email_reply_to_recipients_email_id_email_id_fk";--> statement-breakpoint
ALTER TABLE "email_reply_to_recipients" DROP CONSTRAINT IF EXISTS "email_reply_to_recipients_email_address_id_email_address_id_fk";--> statement-breakpoint
ALTER TABLE "email_to_recipients" DROP CONSTRAINT IF EXISTS "email_to_recipients_email_id_email_id_fk";--> statement-breakpoint
ALTER TABLE "email_to_recipients" DROP CONSTRAINT IF EXISTS "email_to_recipients_email_address_id_email_address_id_fk";--> statement-breakpoint

-- Convert columns from text to uuid
-- Note: This generates new UUIDs. If you have existing data, foreign key relationships will be broken.
ALTER TABLE "email" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email" ALTER COLUMN "thread_id" SET DATA TYPE uuid USING CASE WHEN "thread_id" IS NULL THEN NULL ELSE gen_random_uuid() END;--> statement-breakpoint
ALTER TABLE "email" ALTER COLUMN "from_id" SET DATA TYPE uuid USING CASE WHEN "from_id" IS NULL THEN NULL ELSE gen_random_uuid() END;--> statement-breakpoint
ALTER TABLE "email_address" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_address" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_address" ALTER COLUMN "account_id" SET DATA TYPE uuid USING CASE WHEN "account_id" IS NULL THEN NULL ELSE gen_random_uuid() END;--> statement-breakpoint
ALTER TABLE "email_attachments" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_attachments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_attachments" ALTER COLUMN "email_id" SET DATA TYPE uuid USING CASE WHEN "email_id" IS NULL THEN NULL ELSE gen_random_uuid() END;--> statement-breakpoint
ALTER TABLE "email_bcc_recipients" ALTER COLUMN "email_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_bcc_recipients" ALTER COLUMN "email_address_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_cc_recipients" ALTER COLUMN "email_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_cc_recipients" ALTER COLUMN "email_address_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_reply_to_recipients" ALTER COLUMN "email_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_reply_to_recipients" ALTER COLUMN "email_address_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_to_recipients" ALTER COLUMN "email_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_to_recipients" ALTER COLUMN "email_address_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "mail_account_id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint

-- Re-add foreign key constraints
ALTER TABLE "email" ADD CONSTRAINT "email_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email" ADD CONSTRAINT "email_from_id_email_address_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_address" ADD CONSTRAINT "email_address_account_id_mail_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_attachments" ADD CONSTRAINT "email_attachments_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_bcc_recipients" ADD CONSTRAINT "email_bcc_recipients_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_bcc_recipients" ADD CONSTRAINT "email_bcc_recipients_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_cc_recipients" ADD CONSTRAINT "email_cc_recipients_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_cc_recipients" ADD CONSTRAINT "email_cc_recipients_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reply_to_recipients" ADD CONSTRAINT "email_reply_to_recipients_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reply_to_recipients" ADD CONSTRAINT "email_reply_to_recipients_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_to_recipients" ADD CONSTRAINT "email_to_recipients_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_to_recipients" ADD CONSTRAINT "email_to_recipients_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Add new columns (with default values to handle existing data)
ALTER TABLE "email" ADD COLUMN "provider" "provider" DEFAULT 'gmail' NOT NULL;--> statement-breakpoint
ALTER TABLE "email" ADD COLUMN "provider_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "provider" "provider" DEFAULT 'gmail' NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ADD COLUMN "provider_id" text DEFAULT '' NOT NULL;