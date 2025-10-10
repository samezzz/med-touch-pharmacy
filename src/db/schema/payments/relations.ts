import { relations } from "drizzle-orm";

import { userTable } from "../users/tables";
import { 
  paystackCustomerTable, 
  paystackTransactionTable, 
  paystackSubscriptionTable, 
} from "./tables";

export const paystackCustomerRelations = relations(paystackCustomerTable, ({ one }) => ({
  user: one(userTable, {
    fields: [paystackCustomerTable.userId],
    references: [userTable.id],
  }),
}));

export const paystackTransactionRelations = relations(paystackTransactionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [paystackTransactionTable.userId],
    references: [userTable.id],
  }),
}));

export const paystackSubscriptionRelations = relations(paystackSubscriptionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [paystackSubscriptionTable.userId],
    references: [userTable.id],
  }),
}));

export const extendUserRelations = relations(userTable, ({ many }) => ({
  paystackCustomers: many(paystackCustomerTable),
  paystackTransactions: many(paystackTransactionTable),
  paystackSubscriptions: many(paystackSubscriptionTable),
}));
