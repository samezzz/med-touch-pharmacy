import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

import { userTable } from "../users/tables";

export const paystackCustomerTable = pgTable("paystack_customer", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  paystackCustomerId: integer("paystack_customer_id").notNull().unique(),
  customerCode: text("customer_code").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  metadata: text("metadata"), // JSON string
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const paystackTransactionTable = pgTable("paystack_transaction", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  paystackTransactionId: integer("paystack_transaction_id").notNull().unique(),
  reference: text("reference").notNull().unique(),
  amount: integer("amount").notNull(), // Amount in kobo (smallest currency unit)
  currency: text("currency").notNull().default("GHS"),
  status: text("status").notNull(), // success, failed, pending, abandoned
  gatewayResponse: text("gateway_response"),
  message: text("message"),
  channel: text("channel"), // card, bank, ussd, qr, mobile_money, bank_transfer
  ipAddress: text("ip_address"),
  fees: integer("fees"),
  authorization: text("authorization"), // JSON string
  customer: text("customer"), // JSON string
  plan: text("plan"), // JSON string
  split: text("split"), // JSON string
  orderId: text("order_id"),
  paidAt: timestamp("paid_at"),
  paystackCreatedAt: timestamp("paystack_created_at"),
  metadata: text("metadata"), // JSON string
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const paystackSubscriptionTable = pgTable("paystack_subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  paystackSubscriptionId: integer("paystack_subscription_id").notNull().unique(),
  subscriptionCode: text("subscription_code").notNull().unique(),
  emailToken: text("email_token").notNull(),
  amount: integer("amount").notNull(), // Amount in kobo
  cronExpression: text("cron_expression").notNull(),
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  status: text("status").notNull(), // active, inactive, cancelled, expired
  openInvoice: text("open_invoice"),
  plan: text("plan"), // JSON string
  customer: text("customer"), // JSON string
  metadata: text("metadata"), // JSON string
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const paystackPlanTable = pgTable("paystack_plan", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  paystackPlanId: integer("paystack_plan_id").notNull().unique(),
  name: text("name").notNull(),
  planCode: text("plan_code").notNull().unique(),
  description: text("description"),
  amount: integer("amount").notNull(), // Amount in kobo
  interval: text("interval").notNull(), // daily, weekly, monthly, quarterly, biannually, annually
  sendInvoices: boolean("send_invoices").notNull().default(false),
  sendSms: boolean("send_sms").notNull().default(false),
  hostedPage: boolean("hosted_page").notNull().default(false),
  hostedPageUrl: text("hosted_page_url"),
  hostedPageSummary: text("hosted_page_summary"),
  currency: text("currency").notNull().default("GHS"),
  invoiceLimit: integer("invoice_limit"),
  metadata: text("metadata"), // JSON string
  isActive: boolean("is_active").notNull().default(true),
});