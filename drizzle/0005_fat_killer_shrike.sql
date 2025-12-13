-- First, drop the existing constraint if it exists
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_default_mail_account_mail_account_id_fk";

-- Change the column type from text to uuid
ALTER TABLE "user" ALTER COLUMN "default_mail_account" TYPE uuid USING default_mail_account::uuid;

-- Rename the column
ALTER TABLE "user" RENAME COLUMN "default_mail_account" TO "default_mail_account_id";
