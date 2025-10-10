-- Create Paystack tables only
CREATE TABLE IF NOT EXISTS "paystack_customer" (
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
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paystack_plan" (
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
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paystack_subscription" (
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
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paystack_transaction" (
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
);--> statement-breakpoint
-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "paystack_customer" ADD CONSTRAINT "paystack_customer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "paystack_subscription" ADD CONSTRAINT "paystack_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "paystack_transaction" ADD CONSTRAINT "paystack_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
