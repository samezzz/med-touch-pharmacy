/**
 * Paystack payment service
 * Handles all Paystack API interactions and database operations
 */

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { 
  paystackCustomerTable, 
  paystackTransactionTable, 
  paystackSubscriptionTable, 
  paystackPlanTable 
} from "@/db/schema/payments/tables";
import { 
  PAYSTACK_CONFIG, 
  PAYSTACK_ENDPOINTS, 
  getPaystackHeaders,
  type PaystackTransactionResponse,
  type PaystackCustomerResponse,
  type PaystackSubscriptionResponse,
  type PaystackError
} from "@/lib/paystack";
import { nanoid } from "nanoid";

/**
 * Create a new customer in Paystack and save reference in database
 */
export async function createPaystackCustomer(
  userId: string, 
  email: string, 
  firstName?: string, 
  lastName?: string,
  phone?: string
) {
  try {
    // Check if customer already exists
    const existingCustomer = await getPaystackCustomerByUserId(userId);
    if (existingCustomer) {
      return existingCustomer;
    }

    // Create customer in Paystack
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.customer}`, {
      method: "POST",
      headers: getPaystackHeaders(),
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        metadata: {
          user_id: userId,
        },
      }),
    });

    if (!response.ok) {
      const error: PaystackError = await response.json();
      throw new Error(`Paystack API error: ${error.message}`);
    }

    const data: PaystackCustomerResponse = await response.json();
    
    if (!data.status) {
      throw new Error(`Paystack error: ${data.message}`);
    }

    // Save customer to database
    const customerId = nanoid();
    const customer = await db.insert(paystackCustomerTable).values({
      id: customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      paystackCustomerId: data.data.id,
      customerCode: data.data.customer_code,
      email: data.data.email,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      phone: data.data.phone,
      metadata: JSON.stringify(data.data.metadata),
      userId,
    }).returning();

    return customer[0];
  } catch (error) {
    console.error("Error creating Paystack customer:", error);
    throw error;
  }
}

/**
 * Get customer by user ID from database
 */
export async function getPaystackCustomerByUserId(userId: string) {
  try {
    const customer = await db.query.paystackCustomerTable.findFirst({
      where: (customers, { eq }) => eq(customers.userId, userId),
    });

    return customer;
  } catch (error) {
    console.error("Error fetching Paystack customer:", error);
    return null;
  }
}

/**
 * Initialize a transaction with Paystack
 */
export async function initializePaystackTransaction(
  userId: string,
  amount: number, // Amount in kobo
  email: string,
  planCode?: string,
  metadata?: Record<string, unknown>
) {
  try {
    // Ensure customer exists
    const customer = await createPaystackCustomer(userId, email);
    
    // Generate reference
    const reference = `tx_${nanoid()}`;
    
    // Initialize transaction
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.initialize}`, {
      method: "POST",
      headers: getPaystackHeaders(),
      body: JSON.stringify({
        email,
        amount,
        currency: PAYSTACK_CONFIG.currency,
        reference,
        callback_url: PAYSTACK_CONFIG.callbackUrl,
        metadata: {
          user_id: userId,
          customer_id: customer.id,
          ...metadata,
        },
        ...(planCode && { plan: planCode }),
      }),
    });

    if (!response.ok) {
      const error: PaystackError = await response.json();
      throw new Error(`Paystack API error: ${error.message}`);
    }

    const data: PaystackTransactionResponse = await response.json();
    
    if (!data.status) {
      throw new Error(`Paystack error: ${data.message}`);
    }

    // Save transaction to database
    const transactionId = nanoid();
    await db.insert(paystackTransactionTable).values({
      id: transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      paystackTransactionId: 0, // Will be updated after verification
      reference: data.data.reference,
      amount,
      currency: PAYSTACK_CONFIG.currency,
      status: "pending",
      metadata: JSON.stringify({
        user_id: userId,
        customer_id: customer.id,
        ...metadata,
      }),
      userId,
    });

    return {
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (error) {
    console.error("Error initializing Paystack transaction:", error);
    throw error;
  }
}

/**
 * Verify a transaction with Paystack
 */
export async function verifyPaystackTransaction(reference: string) {
  try {
    const response = await fetch(
      `${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.verify}/${reference}`,
      {
        method: "GET",
        headers: getPaystackHeaders(),
      }
    );

    if (!response.ok) {
      const error: PaystackError = await response.json();
      throw new Error(`Paystack API error: ${error.message}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(`Paystack error: ${data.message}`);
    }

    // Update transaction in database
    await db.update(paystackTransactionTable)
      .set({
        paystackTransactionId: data.data.id,
        status: data.data.status,
        gatewayResponse: data.data.gateway_response,
        message: data.data.message,
        channel: data.data.channel,
        ipAddress: data.data.ip_address,
        fees: data.data.fees,
        authorization: JSON.stringify(data.data.authorization),
        customer: JSON.stringify(data.data.customer),
        plan: data.data.plan ? JSON.stringify(data.data.plan) : null,
        split: data.data.split ? JSON.stringify(data.data.split) : null,
        orderId: data.data.order_id,
        paidAt: data.data.paid_at ? new Date(data.data.paid_at) : null,
        paystackCreatedAt: data.data.created_at ? new Date(data.data.created_at) : null,
        updatedAt: new Date(),
      })
      .where(eq(paystackTransactionTable.reference, reference));

    return data.data;
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    throw error;
  }
}

/**
 * Get all transactions for a user
 */
export async function getUserPaystackTransactions(userId: string) {
  try {
    const transactions = await db.query.paystackTransactionTable.findMany({
      where: (transactions, { eq }) => eq(transactions.userId, userId),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });

    return transactions;
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return [];
  }
}

/**
 * Get all subscriptions for a user
 */
export async function getUserPaystackSubscriptions(userId: string) {
  try {
    const subscriptions = await db.query.paystackSubscriptionTable.findMany({
      where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });

    return subscriptions;
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return [];
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActivePaystackSubscription(userId: string): Promise<boolean> {
  try {
    const subscriptions = await getUserPaystackSubscriptions(userId);
    return subscriptions.some(sub => sub.status === "active");
  } catch (error) {
    console.error("Error checking active subscription:", error);
    return false;
  }
}

/**
 * Create a subscription plan in Paystack
 */
export async function createPaystackPlan(
  name: string,
  amount: number, // Amount in kobo
  interval: "daily" | "weekly" | "monthly" | "quarterly" | "biannually" | "annually",
  description?: string,
  planCode?: string
) {
  try {
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.plan}`, {
      method: "POST",
      headers: getPaystackHeaders(),
      body: JSON.stringify({
        name,
        amount,
        interval,
        currency: PAYSTACK_CONFIG.currency,
        description,
        plan_code: planCode || `plan_${nanoid()}`,
      }),
    });

    if (!response.ok) {
      const error: PaystackError = await response.json();
      throw new Error(`Paystack API error: ${error.message}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(`Paystack error: ${data.message}`);
    }

    // Save plan to database
    const planId = nanoid();
    const plan = await db.insert(paystackPlanTable).values({
      id: planId,
      createdAt: new Date(),
      updatedAt: new Date(),
      paystackPlanId: data.data.id,
      name: data.data.name,
      planCode: data.data.plan_code,
      description: data.data.description,
      amount: data.data.amount,
      interval: data.data.interval,
      sendInvoices: data.data.send_invoices,
      sendSms: data.data.send_sms,
      hostedPage: data.data.hosted_page,
      hostedPageUrl: data.data.hosted_page_url,
      hostedPageSummary: data.data.hosted_page_summary,
      currency: data.data.currency,
      invoiceLimit: data.data.invoice_limit,
      metadata: data.data.metadata ? JSON.stringify(data.data.metadata) : null,
      isActive: true,
    }).returning();

    return plan[0];
  } catch (error) {
    console.error("Error creating Paystack plan:", error);
    throw error;
  }
}

/**
 * Get all available plans
 */
export async function getPaystackPlans() {
  try {
    const plans = await db.query.paystackPlanTable.findMany({
      where: (plans, { eq }) => eq(plans.isActive, true),
      orderBy: (plans, { asc }) => [asc(plans.amount)],
    });

    return plans;
  } catch (error) {
    console.error("Error fetching Paystack plans:", error);
    return [];
  }
}

/**
 * Create a subscription for a user
 */
export async function createPaystackSubscription(
  userId: string,
  planCode: string,
  customerEmail: string,
  authorizationCode?: string
) {
  try {
    // Ensure customer exists
    const customer = await createPaystackCustomer(userId, customerEmail);
    
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.subscription}`, {
      method: "POST",
      headers: getPaystackHeaders(),
      body: JSON.stringify({
        customer: customer.customerCode,
        plan: planCode,
        ...(authorizationCode && { authorization: authorizationCode }),
      }),
    });

    if (!response.ok) {
      const error: PaystackError = await response.json();
      throw new Error(`Paystack API error: ${error.message}`);
    }

    const data: PaystackSubscriptionResponse = await response.json();
    
    if (!data.status) {
      throw new Error(`Paystack error: ${data.message}`);
    }

    // Save subscription to database
    const subscriptionId = nanoid();
    const subscription = await db.insert(paystackSubscriptionTable).values({
      id: subscriptionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      paystackSubscriptionId: data.data.id,
      subscriptionCode: data.data.subscription_code,
      emailToken: data.data.email_token,
      amount: data.data.amount,
      cronExpression: data.data.cron_expression,
      nextPaymentDate: new Date(data.data.next_payment_date),
      status: data.data.status,
      openInvoice: data.data.open_invoice,
      plan: JSON.stringify(data.data.plan),
      customer: JSON.stringify(data.data.customer),
      metadata: data.data.metadata ? JSON.stringify(data.data.metadata) : null,
      userId,
    }).returning();

    return subscription[0];
  } catch (error) {
    console.error("Error creating Paystack subscription:", error);
    throw error;
  }
}
