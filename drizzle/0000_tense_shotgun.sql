CREATE EXTENSION IF NOT EXISTS citext;--> statement-breakpoint
CREATE TYPE "public"."email_label" AS ENUM('inbox', 'sent', 'draft');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('gmail', 'outlook', 'imap', 'yahoo');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"subject" text,
	"from_id" text,
	"has_attachments" boolean,
	"body" text,
	"body_snippet" text,
	"in_reply_to" text,
	"references" text,
	"internet_headers" json[],
	"native_properties" json,
	"folder_id" text,
	"omitted" text,
	"emailLabel" "email_label"
);
--> statement-breakpoint
CREATE TABLE "email_address" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"address" "citext" NOT NULL,
	"account_id" text,
	CONSTRAINT "email_address_address_unique" UNIQUE("address"),
	CONSTRAINT "email_address_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "email_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"inline" boolean,
	"content_id" text,
	"content" text,
	"content_location" text,
	"email_id" text
);
--> statement-breakpoint
CREATE TABLE "email_bcc_recipients" (
	"email_id" text NOT NULL,
	"email_address_id" text NOT NULL,
	CONSTRAINT "email_bcc_recipients_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "email_cc_recipients" (
	"email_id" text NOT NULL,
	"email_address_id" text NOT NULL,
	CONSTRAINT "email_cc_recipients_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "email_reply_to_recipients" (
	"email_id" text NOT NULL,
	"email_address_id" text NOT NULL,
	CONSTRAINT "email_reply_to_recipients_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "email_to_recipients" (
	"email_id" text NOT NULL,
	"email_address_id" text NOT NULL,
	CONSTRAINT "email_to_recipients_email_id_email_address_id_pk" PRIMARY KEY("email_id","email_address_id")
);
--> statement-breakpoint
CREATE TABLE "mail_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"address" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mail_account_provider_account_id_unique" UNIQUE("provider_account_id"),
	CONSTRAINT "mail_account_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "thread" (
	"id" text PRIMARY KEY NOT NULL,
	"mail_account_id" text NOT NULL,
	"subject" text,
	"last_message_date" timestamp,
	"participant_ids" text[],
	"inbox_status" boolean DEFAULT true,
	"draft_status" boolean DEFAULT false,
	"sent_status" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "mail_account" ADD CONSTRAINT "mail_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_mail_account_id_mail_account_id_fk" FOREIGN KEY ("mail_account_id") REFERENCES "public"."mail_account"("id") ON DELETE cascade ON UPDATE no action;