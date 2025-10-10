DO $$ BEGIN
    CREATE TYPE "public"."type" AS ENUM('image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE "uploads" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"type" "type" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"url" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paystack_customer" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"paystack_customer_id" integer NOT NULL,
	"customer_code" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"metadata" text,
	"user_id" text NOT NULL,
	CONSTRAINT "paystack_customer_paystack_customer_id_unique" UNIQUE("paystack_customer_id"),
	CONSTRAINT "paystack_customer_customer_code_unique" UNIQUE("customer_code")
);
--> statement-breakpoint
CREATE TABLE "paystack_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"paystack_plan_id" integer NOT NULL,
	"name" text NOT NULL,
	"plan_code" text NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"interval" text NOT NULL,
	"send_invoices" boolean DEFAULT false NOT NULL,
	"send_sms" boolean DEFAULT false NOT NULL,
	"hosted_page" boolean DEFAULT false NOT NULL,
	"hosted_page_url" text,
	"hosted_page_summary" text,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"invoice_limit" integer,
	"metadata" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "paystack_plan_paystack_plan_id_unique" UNIQUE("paystack_plan_id"),
	CONSTRAINT "paystack_plan_plan_code_unique" UNIQUE("plan_code")
);
--> statement-breakpoint
CREATE TABLE "paystack_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"paystack_subscription_id" integer NOT NULL,
	"subscription_code" text NOT NULL,
	"email_token" text NOT NULL,
	"amount" integer NOT NULL,
	"cron_expression" text NOT NULL,
	"next_payment_date" timestamp NOT NULL,
	"status" text NOT NULL,
	"open_invoice" text,
	"plan" text,
	"customer" text,
	"metadata" text,
	"user_id" text NOT NULL,
	CONSTRAINT "paystack_subscription_paystack_subscription_id_unique" UNIQUE("paystack_subscription_id"),
	CONSTRAINT "paystack_subscription_subscription_code_unique" UNIQUE("subscription_code")
);
--> statement-breakpoint
CREATE TABLE "paystack_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"paystack_transaction_id" integer NOT NULL,
	"reference" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'GHS' NOT NULL,
	"status" text NOT NULL,
	"gateway_response" text,
	"message" text,
	"channel" text,
	"ip_address" text,
	"fees" integer,
	"authorization" text,
	"customer" text,
	"plan" text,
	"split" text,
	"order_id" text,
	"paid_at" timestamp,
	"paystack_created_at" timestamp,
	"metadata" text,
	"user_id" text NOT NULL,
	CONSTRAINT "paystack_transaction_paystack_transaction_id_unique" UNIQUE("paystack_transaction_id"),
	CONSTRAINT "paystack_transaction_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text,
	"token" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"backup_codes" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"age" integer,
	"created_at" timestamp NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"first_name" text,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"last_name" text,
	"name" text NOT NULL,
	"two_factor_enabled" boolean,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"created_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"updated_at" timestamp,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystack_customer" ADD CONSTRAINT "paystack_customer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystack_subscription" ADD CONSTRAINT "paystack_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystack_transaction" ADD CONSTRAINT "paystack_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;