CREATE TYPE "public"."type" AS ENUM('system', 'user');--> statement-breakpoint
CREATE TABLE "email_to_labels" (
	"email_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	CONSTRAINT "email_to_labels_email_id_label_id_pk" PRIMARY KEY("email_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "label" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_id" text,
	"name" text NOT NULL,
	"description" text,
	"type" "type" NOT NULL,
	"color_bg" text,
	"color_text" text,
	"message_list_visibility" text,
	"label_list_visibility" text,
	CONSTRAINT "label_account_id_provider_id_unique" UNIQUE("account_id","provider_id")
);
--> statement-breakpoint
ALTER TABLE "email_to_labels" ADD CONSTRAINT "email_to_labels_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_to_labels" ADD CONSTRAINT "email_to_labels_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "label" ADD CONSTRAINT "label_account_id_mail_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email" DROP COLUMN "emailLabel";--> statement-breakpoint
DROP TYPE "public"."email_label";