#!/usr/bin/env tsx

/**
 * Simple script to seed the database with categories and products
 * Run with: npx tsx scripts/seed-data.ts
 */

import { db } from "../src/db";
import { categoryTable, productTable, inventoryTable, adminRoleTable, adminUserTable } from "../src/db/schema";
import { userTable } from "../src/db/schema/users/tables";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const categories = [
  { name: "Prescriptions", description: "Prescription-only medicines and repeats" },
  { name: "Medicines", description: "General medicines for common conditions" },
  { name: "Vitamins", description: "Essential vitamins and minerals" },
  { name: "Supplements", description: "Dietary and nutritional supplements" },
  { name: "Medical Devices", description: "Home health and diagnostic devices" },
  { name: "Mother & Baby", description: "Maternity and baby care essentials" },
  { name: "Toiletries", description: "Everyday personal care products" },
  { name: "Cold, Cough & Flu", description: "Relief for cold, cough and flu" },
  { name: "First Aid", description: "First aid supplies and wound care" },
  { name: "Allergy & Hayfever", description: "Allergy relief and antihistamines" },
  { name: "Eye Care", description: "Eye health and contact lens care" },
  { name: "Baby Medicine", description: "Medicines formulated for babies" },
  { name: "Dental Care", description: "Oral hygiene and dental health" },
  { name: "Foot Care", description: "Foot health and orthotic care" },
  { name: "Digestion & Stomach", description: "Digestive health and antacids" },
  { name: "Feminine Care", description: "Women's health and intimate care" },
  { name: "Pain Relief", description: "Analgesics and pain management" },
];

const products = [
  {
    name: "Paracetamol 500mg Tablets",
    description: "Effective pain relief and fever reduction. Suitable for adults and children over 12 years.",
    shortDescription: "Pain relief and fever reduction",
    categorySlug: "medicines",
    price: 8.99,
    originalPrice: 12.99,
    sku: "PAR500-001",
    manufacturer: "MediCare Pharma",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60"],
    weight: 50
  },
  {
    name: "Vitamin D3 1000IU Capsules",
    description: "Essential vitamin D supplement for bone health and immune system support.",
    shortDescription: "Vitamin D supplement for bone health",
    categorySlug: "vitamins",
    price: 15.99,
    originalPrice: 19.99,
    sku: "VITD3-001",
    manufacturer: "NutriHealth",
    images: ["https://images.unsplash.com/photo-1550572017-edd951aa87d1?w=800&auto=format&fit=crop&q=60"],
    weight: 30
  },
  {
    name: "Blood Pressure Monitor",
    description: "Digital upper arm blood pressure monitor with large display and memory function.",
    shortDescription: "Digital blood pressure monitor",
    categorySlug: "medical-devices",
    price: 89.99,
    originalPrice: 129.99,
    sku: "BPM-001",
    manufacturer: "HealthTech Pro",
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60"],
    weight: 450
  },
  {
    name: "Baby Teething Gel",
    description: "Natural teething gel for babies with chamomile extract. Sugar-free and alcohol-free.",
    shortDescription: "Natural teething relief for babies",
    categorySlug: "mother-and-baby",
    price: 12.99,
    sku: "BTG-001",
    manufacturer: "BabyCare",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60"],
    weight: 25
  },
  {
    name: "Antibacterial Hand Soap",
    description: "Gentle antibacterial hand soap with moisturizing properties. Kills 99.9% of bacteria.",
    shortDescription: "Antibacterial hand soap",
    categorySlug: "toiletries",
    price: 6.99,
    sku: "AHS-001",
    manufacturer: "CleanCare",
    images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&auto=format&fit=crop&q=60"],
    weight: 500
  },
  {
    name: "Cold & Flu Relief Tablets",
    description: "Multi-symptom relief for cold and flu symptoms including fever, headache, and congestion.",
    shortDescription: "Multi-symptom cold and flu relief",
    categorySlug: "cold-cough-and-flu",
    price: 18.99,
    originalPrice: 24.99,
    sku: "CFR-001",
    manufacturer: "ColdAway",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60"],
    weight: 40
  },
  {
    name: "First Aid Kit - Family Size",
    description: "Comprehensive first aid kit with bandages, antiseptic, and emergency supplies for the whole family.",
    shortDescription: "Comprehensive family first aid kit",
    categorySlug: "first-aid",
    price: 34.99,
    originalPrice: 49.99,
    sku: "FAK-001",
    manufacturer: "SafetyFirst",
    images: ["https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop&q=60"],
    weight: 800
  },
  {
    name: "Antihistamine Tablets",
    description: "Fast-acting antihistamine for allergy relief. Non-drowsy formula suitable for daily use.",
    shortDescription: "Non-drowsy antihistamine for allergies",
    categorySlug: "allergy-and-hayfever",
    price: 14.99,
    sku: "AHT-001",
    manufacturer: "AllergyFree",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60"],
    weight: 35
  },
  {
    name: "Eye Drops - Dry Eye Relief",
    description: "Lubricating eye drops for dry eye relief. Preservative-free formula for sensitive eyes.",
    shortDescription: "Lubricating eye drops for dry eyes",
    categorySlug: "eye-care",
    price: 11.99,
    sku: "EDR-001",
    manufacturer: "EyeCare Plus",
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop&q=60"],
    weight: 15
  },
  {
    name: "Baby Calpol Syrup",
    description: "Gentle pain and fever relief for babies from 2 months. Sugar-free strawberry flavor.",
    shortDescription: "Gentle pain relief for babies",
    categorySlug: "baby-medicine",
    price: 9.99,
    sku: "BCS-001",
    manufacturer: "BabyMed",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60"],
    weight: 100
  },
  {
    name: "Electric Toothbrush",
    description: "Rechargeable electric toothbrush with 2-minute timer and multiple brushing modes.",
    shortDescription: "Rechargeable electric toothbrush",
    categorySlug: "dental-care",
    price: 45.99,
    originalPrice: 69.99,
    sku: "ETB-001",
    manufacturer: "DentalPro",
    images: ["https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&auto=format&fit=crop&q=60"],
    weight: 200
  },
  {
    name: "Foot Care Cream",
    description: "Moisturizing foot cream with tea tree oil for dry, cracked feet. Fast-absorbing formula.",
    shortDescription: "Moisturizing foot cream with tea tree oil",
    categorySlug: "foot-care",
    price: 8.99,
    sku: "FCC-001",
    manufacturer: "FootCare",
    images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&auto=format&fit=crop&q=60"],
    weight: 100
  },
  {
    name: "Antacid Tablets",
    description: "Fast-acting antacid for heartburn and indigestion relief. Mint flavor.",
    shortDescription: "Fast-acting antacid for heartburn",
    categorySlug: "digestion-and-stomach",
    price: 7.99,
    sku: "AAT-001",
    manufacturer: "DigestCare",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60"],
    weight: 30
  },
  {
    name: "Feminine Hygiene Wash",
    description: "Gentle pH-balanced intimate wash for daily use. Dermatologically tested.",
    shortDescription: "pH-balanced intimate wash",
    categorySlug: "feminine-care",
    price: 13.99,
    sku: "FHW-001",
    manufacturer: "FemCare",
    images: ["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&auto=format&fit=crop&q=60"],
    weight: 250
  },
  {
    name: "Ibuprofen 400mg Tablets",
    description: "Anti-inflammatory pain relief for headaches, muscle pain, and inflammation.",
    shortDescription: "Anti-inflammatory pain relief",
    categorySlug: "pain-relief",
    price: 16.99,
    originalPrice: 22.99,
    sku: "IBU400-001",
    manufacturer: "PainRelief Co",
    images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60"],
    weight: 45
  }
];

async function seedData() {
  try {
    console.log("🌱 Starting database seeding...");

    const now = new Date();

    // 1. Create admin roles if they don't exist
    console.log("📋 Creating admin roles...");
    const existingRoles = await db.query.adminRoleTable.findMany();
    
    if (existingRoles.length === 0) {
      const roles = [
        {
          id: "super_admin",
          name: "super_admin",
          description: "Manager with full access",
          permissions: JSON.stringify({
            canManageProducts: true,
            canManageCategories: true,
            canManageInventory: true,
            canManageAdmins: true,
            canViewAnalytics: true,
            canManageOrders: true,
            canManageCustomers: true,
            canManageSettings: true,
          }),
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "admin",
          name: "admin",
          description: "Administrator with most permissions",
          permissions: JSON.stringify({
            canManageProducts: true,
            canManageCategories: true,
            canManageInventory: true,
            canManageAdmins: false,
            canViewAnalytics: false,
            canManageOrders: true,
            canManageCustomers: false,
            canManageSettings: false,
          }),
          createdAt: now,
          updatedAt: now,
        },
      ];

      await db.insert(adminRoleTable).values(roles);
      console.log("✅ Admin roles created");
    } else {
      console.log("✅ Admin roles already exist");
    }

    // 2. Get or create a system admin user
    console.log("👤 Getting system admin user...");
    let systemAdminId: string;
    
    const existingAdmins = await db.query.adminUserTable.findMany();
    
    if (existingAdmins.length === 0) {
      // Create a system user first
      const systemUser = await db.insert(userTable).values({
        id: "system_admin",
        name: "System Administrator",
        email: "admin@medtouch.com",
        emailVerified: now,
        createdAt: now,
        updatedAt: now,
      }).returning();

      // Make them an admin
      const adminUser = await db.insert(adminUserTable).values({
        id: "admin_system_admin",
        userId: systemUser[0].id,
        roleId: "super_admin",
        isActive: true,
        createdBy: systemUser[0].id,
        createdAt: now,
        updatedAt: now,
      }).returning();
      
      systemAdminId = adminUser[0].id;
      console.log("✅ System admin user created");
    } else {
      systemAdminId = existingAdmins[0].id;
      console.log("✅ Using existing admin user");
    }

    // 3. Create categories
    console.log("📂 Creating categories...");
    const existingCategories = await db.query.categoryTable.findMany();
    const existingCategoryNames = new Set(existingCategories.map(c => c.name.toLowerCase()));

    const newCategories = categories
      .filter(c => !existingCategoryNames.has(c.name.toLowerCase()))
      .map((c, index) => ({
        id: `cat-${slugify(c.name)}`,
        name: c.name.trim(),
        slug: slugify(c.name),
        description: c.description || "",
        image: "",
        isActive: true,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
        createdBy: systemAdminId,
      }));

    if (newCategories.length > 0) {
      await db.insert(categoryTable).values(newCategories);
      console.log(`✅ Created ${newCategories.length} categories`);
    } else {
      console.log("✅ Categories already exist");
    }

    // 4. Create products
    console.log("📦 Creating products...");
    const allCategories = await db.query.categoryTable.findMany();
    const categorySlugToId = new Map(allCategories.map(c => [c.slug, c.id]));

    const existingProducts = await db.query.productTable.findMany();
    const existingSkus = new Set(existingProducts.map(p => p.sku));

    const newProducts = products
      .filter(p => !existingSkus.has(p.sku))
      .map((p, index) => ({
        id: `prod-${p.sku.toLowerCase()}`,
        name: p.name.trim(),
        slug: slugify(p.name),
        description: p.description,
        shortDescription: p.shortDescription,
        categoryId: categorySlugToId.get(p.categorySlug) || allCategories[0]?.id,
        price: p.price.toString(),
        originalPrice: p.originalPrice?.toString() || null,
        sku: p.sku,
        barcode: `BC${p.sku}`,
        images: JSON.stringify(p.images),
        isActive: true,
        isFeatured: index < 5, // First 5 products are featured
        requiresPrescription: p.requiresPrescription || false,
        weight: p.weight?.toString() || null,
        manufacturer: p.manufacturer,
        createdAt: now,
        updatedAt: now,
        createdBy: systemAdminId,
      }));

    if (newProducts.length > 0) {
      await db.insert(productTable).values(newProducts);
      console.log(`✅ Created ${newProducts.length} products`);

      // 5. Create inventory records
      console.log("📊 Creating inventory records...");
      const inventoryRecords = newProducts.map(p => ({
        id: `inv-${p.id}`,
        productId: p.id,
        quantityInStock: Math.floor(Math.random() * 100) + 10, // Random stock 10-110
        quantityReserved: 0,
        quantityAvailable: Math.floor(Math.random() * 100) + 10,
        lowStockThreshold: 10,
        reorderPoint: 5,
        reorderQuantity: 50,
        createdAt: now,
        updatedAt: now,
      }));

      await db.insert(inventoryTable).values(inventoryRecords);
      console.log(`✅ Created ${inventoryRecords.length} inventory records`);
    } else {
      console.log("✅ Products already exist");
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Categories: ${allCategories.length}`);
    console.log(`- Products: ${existingProducts.length + newProducts.length}`);
    console.log(`- Inventory records: ${newProducts.length}`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding
seedData().then(() => {
  console.log("✨ Done!");
  process.exit(0);
});
