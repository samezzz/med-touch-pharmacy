/**
 * Paystack configuration and utilities
 */

export const PAYSTACK_CONFIG = {
  // Public key for client-side operations
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  
  // Secret key for server-side operations
  secretKey: process.env.PAYSTACK_SECRET_KEY || "",
  
  // Base URL for Paystack API
  baseUrl: "https://api.paystack.co",
  
  // Webhook secret for verifying webhook signatures
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || "",
  
  // Currency (GHS for Ghana)
  currency: "GHS",
  
  // Default callback URL
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/payments/callback",
  
  // Default redirect URL after successful payment
  redirectUrl: process.env.NEXT_PUBLIC_APP_URL + "/dashboard/billing?payment=success",
} as const;

/**
 * Paystack API endpoints
 */
export const PAYSTACK_ENDPOINTS = {
  initialize: "/transaction/initialize",
  verify: "/transaction/verify",
  customer: "/customer",
  subscription: "/subscription",
  plan: "/plan",
  webhook: "/webhook",
} as const;

/**
 * Paystack transaction status
 */
export const PAYSTACK_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
  PENDING: "pending",
  ABANDONED: "abandoned",
} as const;

/**
 * Paystack subscription status
 */
export const PAYSTACK_SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

/**
 * Validate Paystack configuration
 */
export function validatePaystackConfig(): boolean {
  if (!PAYSTACK_CONFIG.publicKey) {
    console.error("PAYSTACK_PUBLIC_KEY is required");
    return false;
  }
  
  if (!PAYSTACK_CONFIG.secretKey) {
    console.error("PAYSTACK_SECRET_KEY is required");
    return false;
  }
  
  return true;
}

/**
 * Get Paystack headers for API requests
 */
export function getPaystackHeaders() {
  return {
    "Authorization": `Bearer ${PAYSTACK_CONFIG.secretKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * Paystack error types
 */
export interface PaystackError {
  status: boolean;
  message: string;
  data?: unknown;
}

/**
 * Paystack transaction response
 */
export interface PaystackTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Paystack customer response
 */
export interface PaystackCustomerResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: Record<string, unknown> | null;
    risk_action: string;
    international_format_phone: string | null;
  };
}

/**
 * Paystack subscription response
 */
export interface PaystackSubscriptionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    subscription_code: string;
    email_token: string;
    amount: number;
    cron_expression: string;
    next_payment_date: string;
    open_invoice: string | null;
    createdAt: string;
    updatedAt: string;
    // Optional fields present in some responses
    plan?: unknown;
    customer?: unknown;
    metadata?: Record<string, unknown> | null;
  };
}
