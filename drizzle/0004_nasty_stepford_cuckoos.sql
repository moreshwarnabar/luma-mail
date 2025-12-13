-- Add column as uuid (or alter if it already exists as text)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'default_mail_account') THEN
        ALTER TABLE "user" ADD COLUMN "default_mail_account" uuid;
    ELSE
        ALTER TABLE "user" ALTER COLUMN "default_mail_account" TYPE uuid USING default_mail_account::uuid;
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_default_mail_account_mail_account_id_fk" FOREIGN KEY ("default_mail_account") REFERENCES "public"."mail_account"("id") ON DELETE no action ON UPDATE no action;