CREATE TYPE "public"."meeting_message_method" AS ENUM('request', 'reply', 'cancel', 'counter', 'other');--> statement-breakpoint
CREATE TYPE "public"."sensitivity" AS ENUM('normal', 'private', 'personal', 'confidential');--> statement-breakpoint
CREATE TABLE "email" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"created_at" timestamp,
	"last_modified_at" timestamp,
	"sent_at" timestamp,
	"received_at" timestamp,
	"internet_message_id" text,
	"subject" text,
	"sys_labels" text[],
	"keywords" text[],
	"sys_classifications" text[],
	"sensitivity" "sensitivity",
	"meetingMessageMethod" "meeting_message_method",
	"from" uuid NOT NULL,
	"has_attachments" boolean,
	"body" text,
	"body_snippet" text,
	"in_reply_to" text,
	"references" text,
	"thread_index" text,
	"internet_headers" jsonb,
	"native_properties" jsonb,
	"folder_id" text,
	"web_link" text,
	"omitted" text[]
);
--> statement-breakpoint
CREATE TABLE "email_address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mail_account_id" uuid NOT NULL,
	"name" text,
	"address" text NOT NULL,
	"raw" text
);
--> statement-breakpoint
CREATE TABLE "email_attachment" (
	"id" text,
	"email_id" text NOT NULL,
	"name" text,
	"mimeType" text,
	"size" integer,
	"inline" boolean,
	"content_id" text,
	"content" text,
	"location" text
);
--> statement-breakpoint
CREATE TABLE "email_bcc" (
	"email_id" text NOT NULL,
	"email_address_id" uuid NOT NULL,
	CONSTRAINT "email_bcc_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "email_cc" (
	"email_id" text NOT NULL,
	"email_address_id" uuid NOT NULL,
	CONSTRAINT "email_cc_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "email_reply_to" (
	"email_id" text NOT NULL,
	"email_address_id" uuid NOT NULL,
	CONSTRAINT "email_reply_to_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "email_to" (
	"email_id" text NOT NULL,
	"email_address_id" uuid NOT NULL,
	CONSTRAINT "email_to_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "thread" (
	"id" text PRIMARY KEY NOT NULL,
	"mail_account_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email" ADD CONSTRAINT "email_thread_id_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email" ADD CONSTRAINT "email_from_email_address_id_fk" FOREIGN KEY ("from") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_address" ADD CONSTRAINT "email_address_mail_account_id_mail_account_id_fk" FOREIGN KEY ("mail_account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_attachment" ADD CONSTRAINT "email_attachment_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_bcc" ADD CONSTRAINT "email_bcc_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_bcc" ADD CONSTRAINT "email_bcc_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_cc" ADD CONSTRAINT "email_cc_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_cc" ADD CONSTRAINT "email_cc_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reply_to" ADD CONSTRAINT "email_reply_to_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reply_to" ADD CONSTRAINT "email_reply_to_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_to" ADD CONSTRAINT "email_to_email_id_email_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."email"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_to" ADD CONSTRAINT "email_to_email_address_id_email_address_id_fk" FOREIGN KEY ("email_address_id") REFERENCES "public"."email_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_mail_account_id_mail_account_id_fk" FOREIGN KEY ("mail_account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;