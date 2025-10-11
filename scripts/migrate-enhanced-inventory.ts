import { db } from "@/db";
import { productTable, inventoryTable, categoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Migration script to ensure database schema is ready for enhanced inventory management
 * This script:
 * 1. Ensures all products have corresponding inventory records
 * 2. Updates any missing inventory data
 * 3. Validates data integrity
 */

async function migrateEnhancedInventory() {
  console.log("🚀 Starting enhanced inventory migration...");

  try {
    // Get all products
    const products = await db.query.productTable.findMany({
      with: {
        inventory: true,
      },
    });

    console.log(`📦 Found ${products.length} products`);

    let createdInventoryCount = 0;
    let updatedInventoryCount = 0;

    for (const product of products) {
      if (!product.inventory) {
        // Create inventory record for products without one
        const newInventory = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          quantityInStock: 0,
          quantityReserved: 0,
          quantityAvailable: 0,
          lowStockThreshold: 10,
          reorderPoint: 5,
          reorderQuantity: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(inventoryTable).values(newInventory);
        createdInventoryCount++;
        console.log(`✅ Created inventory for product: ${product.name}`);
      } else {
        // Update existing inventory to ensure all fields are present
        const inventory = product.inventory;
        const updates: any = {};

        if (inventory.lowStockThreshold === null || inventory.lowStockThreshold === undefined) {
          updates.lowStockThreshold = 10;
        }
        if (inventory.reorderPoint === null || inventory.reorderPoint === undefined) {
          updates.reorderPoint = 5;
        }
        if (inventory.reorderQuantity === null || inventory.reorderQuantity === undefined) {
          updates.reorderQuantity = 50;
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date();
          await db.update(inventoryTable)
            .set(updates)
            .where(eq(inventoryTable.id, inventory.id));
          updatedInventoryCount++;
          console.log(`🔄 Updated inventory for product: ${product.name}`);
        }
      }
    }

    // Validate data integrity
    console.log("🔍 Validating data integrity...");
    
    const allProductsWithInventory = await db.query.productTable.findMany({
      with: {
        inventory: true,
      },
    });

    const productsWithoutInventory = allProductsWithInventory.filter(p => !p.inventory);
    const inventoryWithoutProducts = await db.query.inventoryTable.findMany({
      with: {
        product: true,
      },
    });
    const orphanedInventory = inventoryWithoutProducts.filter(inv => !inv.product);

    console.log(`📊 Migration Summary:`);
    console.log(`   - Products processed: ${products.length}`);
    console.log(`   - New inventory records created: ${createdInventoryCount}`);
    console.log(`   - Existing inventory records updated: ${updatedInventoryCount}`);
    console.log(`   - Products without inventory: ${productsWithoutInventory.length}`);
    console.log(`   - Orphaned inventory records: ${orphanedInventory.length}`);

    if (productsWithoutInventory.length > 0) {
      console.log("⚠️  Warning: Some products still don't have inventory records");
      productsWithoutInventory.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    }

    if (orphanedInventory.length > 0) {
      console.log("⚠️  Warning: Some inventory records don't have associated products");
      orphanedInventory.forEach(inv => console.log(`   - Inventory ${inv.id} for product ${inv.productId}`));
    }

    console.log("✅ Enhanced inventory migration completed successfully!");

  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateEnhancedInventory()
    .then(() => {
      console.log("🎉 Migration completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

export { migrateEnhancedInventory };
