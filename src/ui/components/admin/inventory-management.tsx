"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Minus, Search, Filter, AlertTriangle, TrendingUp, TrendingDown, Package } from "lucide-react";

import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/primitives/card";
import { Badge, badgeVariants } from "@/ui/primitives/badge";
import type { VariantProps } from "class-variance-authority";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/primitives/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/primitives/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/primitives/select";
import { Label } from "@/ui/primitives/label";
import { Textarea } from "@/ui/primitives/textarea";
import { FallbackImage } from "@/ui/components/fallback-image";
import type { AdminUserWithDetails, Inventory, Product, InventoryTransaction } from "@/db/schema";

interface InventoryManagementProps {
  adminUser: AdminUserWithDetails;
}

export function InventoryManagement({ adminUser }: InventoryManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    type: "adjustment",
    quantity: 0,
    reason: "adjustment",
    reference: "",
    notes: "",
  });

  const getProductById = (productId: string) => {
    return products.find(prod => prod.id === productId);
  };

  // Load inventory with products
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await fetch('/api/admin/inventory');
        if (!res.ok) return;
        const data = await res.json();
        setInventory(data?.inventory ?? []);
        const unique = new Map<string, Product>();
        for (const inv of data?.inventory ?? []) {
          if (inv.product && !unique.has(inv.product.id)) unique.set(inv.product.id, inv.product);
        }
        if (unique.size) setProducts(Array.from(unique.values()));
        if (Array.isArray(data?.recentTransactions)) setTransactions(data.recentTransactions);
      } catch {}
    };
    loadInventory();
  }, []);

  // Query products endpoint for search suggestions
  const searchProducts = useCallback(async (query: string) => {
    setIsSearchingProducts(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      params.set('limit', '10');
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) return setProductResults([]);
      const data = await res.json();
      setProductResults(Array.isArray(data?.products) ? data.products : []);
    } catch {
      setProductResults([]);
    } finally {
      setIsSearchingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (productSearch.trim().length < 2) {
      setProductResults([]);
      return;
    }
    const t = setTimeout(() => searchProducts(productSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [productSearch, searchProducts]);

  const getInventoryWithProduct = () => {
    return inventory.map(inv => ({
      ...inv,
      product: getProductById(inv.productId),
    })).filter(inv => inv.product);
  };

  const filteredInventory = getInventoryWithProduct().filter(inv => {
    const matchesSearch = inv.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.product?.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === "low-stock") {
      matchesFilter = inv.quantityInStock <= inv.lowStockThreshold;
    } else if (selectedFilter === "out-of-stock") {
      matchesFilter = inv.quantityInStock === 0;
    } else if (selectedFilter === "reorder") {
      matchesFilter = inv.quantityInStock <= inv.reorderPoint;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleStockAdjustment = () => {
    if (!selectedProduct) return;

    const adjustment: InventoryTransaction = {
      id: `trans-${Date.now()}`,
      productId: selectedProduct.id,
      type: adjustmentData.type as "in" | "out" | "adjustment",
      quantity: adjustmentData.quantity,
      reason: adjustmentData.reason,
      reference: adjustmentData.reference,
      notes: adjustmentData.notes,
      performedBy: adminUser.id,
      createdAt: new Date(),
    };

    // Add transaction
    setTransactions([adjustment, ...transactions]);

    // Update inventory
    setInventory(inventory.map(inv => {
      if (inv.productId === selectedProduct.id) {
        const newQuantity = inv.quantityInStock + adjustmentData.quantity;
        return {
          ...inv,
          quantityInStock: Math.max(0, newQuantity),
          quantityAvailable: Math.max(0, newQuantity - inv.quantityReserved),
          lastCounted: new Date(),
          updatedAt: new Date(),
        };
      }
      return inv;
    }));

    // Reset form
    setAdjustmentData({
      type: "adjustment",
      quantity: 0,
      reason: "adjustment",
      reference: "",
      notes: "",
    });
    setIsAdjustmentDialogOpen(false);
    setSelectedProduct(null);
  };

  const getStockStatus = (inventory: Inventory) => {
    if (inventory.quantityInStock === 0) {
      return { status: "out-of-stock", color: "destructive", text: "Out of Stock" };
    } else if (inventory.quantityInStock <= inventory.reorderPoint) {
      return { status: "reorder", color: "destructive", text: "Reorder" };
    } else if (inventory.quantityInStock <= inventory.lowStockThreshold) {
      return { status: "low-stock", color: "secondary", text: "Low Stock" };
    } else {
      return { status: "in-stock", color: "default", text: "In Stock" };
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Track stock levels, manage inventory, and monitor product availability
          </p>
        </div>
        <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Stock Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Stock Adjustment</DialogTitle>
              <DialogDescription>
                Adjust stock levels for a product.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="product">Product</Label>
                <div className="relative">
                  <Input
                    id="product"
                    placeholder="Search product by name or SKU..."
                    value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : productSearch}
                    onChange={(e) => {
                      setSelectedProduct(null);
                      setProductSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (productSearch.trim().length >= 2) searchProducts(productSearch.trim());
                    }}
                  />
                  {selectedProduct === null && productSearch.trim().length >= 2 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                      <div className="max-h-60 overflow-auto">
                        {isSearchingProducts ? (
                          <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                        ) : productResults.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground">No products found</div>
                        ) : (
                          productResults.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                              onClick={() => {
                                setSelectedProduct(p);
                                setProductSearch("");
                                setProductResults([]);
                              }}
                            >
                              {p.name} ({p.sku})
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedProduct && (
                  <div className="text-xs text-muted-foreground">Selected: {selectedProduct.name} ({selectedProduct.sku})</div>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Adjustment Type</Label>
                <Select value={adjustmentData.type} onValueChange={(value) => setAdjustmentData({ ...adjustmentData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In (+)</SelectItem>
                    <SelectItem value="out">Stock Out (-)</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={adjustmentData.quantity}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Select value={adjustmentData.reason} onValueChange={(value) => setAdjustmentData({ ...adjustmentData, reason: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={adjustmentData.reference}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reference: e.target.value })}
                  placeholder="Order ID, PO number, etc."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStockAdjustment} disabled={!selectedProduct}>
                Apply Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventory.filter(inv => inv.quantityInStock <= inv.lowStockThreshold).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventory.filter(inv => inv.quantityInStock === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent restock needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GHS {inventory.reduce((total, inv) => {
                const product = getProductById(inv.productId);
                return total + (parseFloat(product?.price || "0") * inv.quantityInStock);
              }, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter inventory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="reorder">Reorder Point</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>
            Current stock levels and status for all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((inv) => {
                const product = inv.product!;
                const images = JSON.parse(product.images || "[]");
                const stockStatus = getStockStatus(inv);
                
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden">
                          <FallbackImage
                            src={images[0] || ""}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.manufacturer}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{inv.quantityInStock}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{inv.quantityReserved}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{inv.quantityAvailable}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Low: {inv.lowStockThreshold}</div>
                        <div>Reorder: {inv.reorderPoint}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color as VariantProps<typeof badgeVariants>["variant"]}>
                        {stockStatus.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {inv.lastRestocked?.toLocaleDateString() || "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsAdjustmentDialogOpen(true);
                        }}
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inventory Transactions</CardTitle>
          <CardDescription>
            Latest stock movements and adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => {
              const product = getProductById(transaction.productId);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{product?.name}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.reason} • {transaction.reference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
