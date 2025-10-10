// Re-export Paystack service functions for backward compatibility
export {
  createPaystackCustomer as createCustomer,
  getPaystackCustomerByUserId as getCustomerByUserId,
  getUserPaystackSubscriptions as getUserSubscriptions,
  hasActivePaystackSubscription as hasActiveSubscription,
  initializePaystackTransaction,
  verifyPaystackTransaction,
  getUserPaystackTransactions,
  createPaystackPlan,
  getPaystackPlans,
  createPaystackSubscription,
} from "./paystack-service";

import {
  getPaystackCustomerByUserId,
  getUserPaystackSubscriptions,
  initializePaystackTransaction,
} from "./paystack-service";

/**
 * Get customer state from Paystack API
 */
export async function getCustomerState(userId: string) {
  const customer = await getPaystackCustomerByUserId(userId);
  if (!customer) {
    return null;
  }

  const subscriptions = await getUserPaystackSubscriptions(userId);
  
  return {
    id: customer.id,
    email: customer.email,
    subscriptions: subscriptions.map(sub => ({
      id: sub.id,
      productId: (() => {
        try {
          const plan = sub.plan ? JSON.parse(sub.plan as unknown as string) : null;
          return plan?.plan_code ?? null;
        } catch {
          return null;
        }
      })(),
      subscriptionId: sub.subscriptionCode,
      status: sub.status,
    })),
  };
}

/**
 * Get checkout URL for a specific product
 */
export async function getCheckoutUrl(
  userId: string, 
  email: string, 
  amount: number, 
  productSlug: string
): Promise<string | null> {
  try {
    const result = await initializePaystackTransaction(
      userId,
      amount,
      email,
      undefined,
      { product_slug: productSlug }
    );
    
    return result.authorizationUrl;
  } catch (error) {
    console.error("Error getting checkout URL:", error);
    return null;
  }
}

/**
 * Sync subscription data between Paystack and our database
 */
export async function syncSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string,
  productId: string,
  status: string,
) {
  // This function can be used to sync subscription data from webhooks
  // Implementation depends on your specific needs
  console.log("Syncing subscription:", { userId, customerId, subscriptionId, productId, status });
  return null;
}