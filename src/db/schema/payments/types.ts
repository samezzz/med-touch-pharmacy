import type { InferSelectModel } from "drizzle-orm";

import { 
  paystackCustomerTable, 
  paystackTransactionTable, 
  paystackSubscriptionTable, 
  paystackPlanTable 
} from "./tables";

export type PaystackCustomer = InferSelectModel<typeof paystackCustomerTable>;
export type PaystackTransaction = InferSelectModel<typeof paystackTransactionTable>;
export type PaystackSubscription = InferSelectModel<typeof paystackSubscriptionTable>;
export type PaystackPlan = InferSelectModel<typeof paystackPlanTable>;