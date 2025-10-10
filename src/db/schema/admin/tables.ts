import { pgTable, text, timestamp, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { userTable } from "../users/tables";

// Admin roles table
export const adminRoleTable = pgTable("admin_role", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // "super_admin", "admin", "manager"
  description: text("description"),
  permissions: text("permissions").notNull(), // JSON string of permissions
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Admin users table (extends user table)
export const adminUserTable = pgTable("admin_user", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  roleId: text("role_id")
    .notNull()
    .references(() => adminRoleTable.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by")
    .references(() => userTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Categories table
export const categoryTable = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => adminUserTable.id, { onDelete: "cascade" }),
});

// Products table
export const productTable = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode"),
  images: text("images").notNull(), // JSON array of image URLs
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  requiresPrescription: boolean("requires_prescription").notNull().default(false),
  weight: decimal("weight", { precision: 8, scale: 2 }), // in grams
  dimensions: text("dimensions"), // JSON: {length, width, height}
  manufacturer: text("manufacturer"),
  expiryDate: timestamp("expiry_date"),
  batchNumber: text("batch_number"),
  tags: text("tags"), // JSON array of tags
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => adminUserTable.id, { onDelete: "cascade" }),
});

// Inventory table
export const inventoryTable = pgTable("inventory", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" })
    .unique(),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  quantityReserved: integer("quantity_reserved").notNull().default(0),
  quantityAvailable: integer("quantity_available").notNull().default(0), // calculated field
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  reorderPoint: integer("reorder_point").notNull().default(5),
  reorderQuantity: integer("reorder_quantity").notNull().default(50),
  lastRestocked: timestamp("last_restocked"),
  lastCounted: timestamp("last_counted"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Inventory transactions table (for tracking stock movements)
export const inventoryTransactionTable = pgTable("inventory_transaction", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "in", "out", "adjustment", "transfer"
  quantity: integer("quantity").notNull(), // positive for in, negative for out
  reason: text("reason").notNull(), // "purchase", "sale", "return", "damage", "adjustment"
  reference: text("reference"), // order ID, purchase order, etc.
  notes: text("notes"),
  performedBy: text("performed_by")
    .notNull()
    .references(() => adminUserTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
});

// Product variants table (for different sizes, colors, etc.)
export const productVariantTable = pgTable("product_variant", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Small", "Red", "500mg", etc.
  sku: text("sku").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  attributes: text("attributes"), // JSON: {size: "L", color: "red"}
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
