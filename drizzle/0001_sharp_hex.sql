ALTER TABLE "mail_account" ADD COLUMN "aurinko_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "mail_account" ADD CONSTRAINT "mail_account_aurinko_id_unique" UNIQUE("aurinko_id");--> statement-breakpoint
ALTER TABLE "mail_account" ADD CONSTRAINT "mail_account_email_address_unique" UNIQUE("email_address");