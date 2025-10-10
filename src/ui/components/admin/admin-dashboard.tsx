"use client";

import { Package, FolderOpen, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/primitives/card";
import { Skeleton } from "@/ui/primitives/skeleton";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { Alert, AlertDescription } from "@/ui/primitives/alert";
import type { AdminUserWithDetails } from "@/db/schema";

interface AdminDashboardProps {
  adminUser: AdminUserWithDetails;
}

type InventoryItem = {
  product: { id: string; name: string };
  quantityInStock: number;
  lowStockThreshold: number;
};

export function AdminDashboard({ adminUser }: AdminDashboardProps) {
  const hasPermission = (permission: keyof typeof adminUser.role.permissions) => {
    return adminUser.role.permissions[permission] === true;
  };

  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [lowStockItems, setLowStockItems] = useState<number | null>(null);
  const [lowStockList, setLowStockList] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // products count via pagination.total
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products?limit=1');
        if (!res.ok) return;
        const data = await res.json();
        setTotalProducts(Number(data?.pagination?.total ?? 0));
      } catch {}
    };

    // categories list length
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) return;
        const data = await res.json();
        setTotalCategories(Array.isArray(data?.categories) ? data.categories.length : 0);
      } catch {}
    };

    // inventory stats and low stock list
    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/admin/inventory');
        if (!res.ok) return;
        const data = await res.json();
        setLowStockItems(Number(data?.stats?.lowStockItems ?? 0));
        type ApiInventory = {
          product?: { id: string; name: string } | null;
          quantityInStock: number;
          lowStockThreshold: number;
        };
        const list: InventoryItem[] = ((data?.inventory as ApiInventory[]) ?? [])
          .filter((inv) => inv.quantityInStock <= inv.lowStockThreshold)
          .map((inv) => ({
            product: { id: inv.product?.id ?? "", name: inv.product?.name ?? "" },
            quantityInStock: inv.quantityInStock,
            lowStockThreshold: inv.lowStockThreshold,
          }));
        setLowStockList(list.slice(0, 5));
      } catch {}
    };

    fetchProducts();
    fetchCategories();
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {adminUser.user?.name?.split(" ")[0] || "Admin"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&#39;s what&#39;s happening with your pharmacy today.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm w-fit">
          {adminUser.role?.name?.replace("_", " ").toUpperCase() || "ADMIN"}
        </Badge>
      </div>

      {/* Alerts */}
      {Boolean(lowStockItems && lowStockItems > 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {lowStockItems} products with low stock. 
            <Button variant="link" className="p-0 h-auto ml-2">
              Review inventory
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {hasPermission("canManageProducts") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {totalProducts === null ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{totalProducts}</div>
              )}
            </CardContent>
          </Card>
        )}

        {hasPermission("canManageCategories") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {totalCategories === null ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold">{totalCategories}</div>
              )}
            </CardContent>
          </Card>
        )}

        {hasPermission("canManageInventory") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {lowStockItems === null ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inventory Alerts */}
      {hasPermission("canManageInventory") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockList.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No low stock items.</div>
                ) : (
                  lowStockList.map((product) => (
                    <div key={product.product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Current: {product.quantityInStock} | Threshold: {product.lowStockThreshold}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
