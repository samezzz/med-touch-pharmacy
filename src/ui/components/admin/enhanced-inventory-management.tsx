"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Package, Trash2 } from "lucide-react";

import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/primitives/card";
import { Badge } from "@/ui/primitives/badge";
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
import type { AdminUserWithDetails, Inventory, Product, Category } from "@/db/schema";

interface InventoryManagementProps {
  adminUser: AdminUserWithDetails;
}

export function EnhancedInventoryManagement({ }: InventoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    type: "adjustment",
    quantity: 0,
    reason: "adjustment",
    reference: "",
    notes: "",
  });

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    price: "",
    originalPrice: "",
    sku: "",
    barcode: "",
    images: "",
    isActive: true,
    isFeatured: false,
    requiresPrescription: false,
    weight: "",
    manufacturer: "",
    expiryDate: "",
    batchNumber: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
  });

  // Fetch categories and products from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Load enhanced inventory with products
  const loadInventory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (selectedFilter !== 'all') params.append('status', selectedFilter);
      
      const res = await fetch(`/api/admin/inventory?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      
      // Set products (which now include inventory data)
      setProducts(data.products || []);
      
      // Extract inventory data from products
      const inventoryData = data.products?.map((product: Product & { inventory?: Inventory }) => product.inventory).filter(Boolean) || [];
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }, [searchQuery, selectedCategory, selectedFilter]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchCategories();
    loadInventory();
  }, [loadInventory]);


  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get inventory data for a product
  const getInventoryData = (productId: string) => {
    return inventory.find(inv => inv.productId === productId);
  };

  // Get status badge for inventory
  const getStatusBadge = (inventoryData: Inventory | undefined) => {
    if (!inventoryData) return <Badge variant="secondary">No Inventory</Badge>;
    
    if (inventoryData.quantityInStock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (inventoryData.quantityInStock <= inventoryData.lowStockThreshold) {
      return <Badge variant="destructive">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  // Create new product
  const handleCreateProduct = async () => {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-product',
          ...newProduct,
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewProduct({
          name: "", slug: "", description: "", shortDescription: "",
          categoryId: "", price: "", originalPrice: "", sku: "",
          barcode: "", images: "", isActive: true, isFeatured: false,
          requiresPrescription: false, weight: "", manufacturer: "",
          expiryDate: "", batchNumber: "", tags: "", seoTitle: "", seoDescription: "",
        });
        loadInventory();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };


  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadInventory();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Handle inventory adjustment
  const handleInventoryAdjustment = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust-inventory',
          productId: selectedProduct.id,
          ...adjustmentData,
        }),
      });

      if (response.ok) {
        setIsAdjustmentDialogOpen(false);
        setSelectedProduct(null);
        setAdjustmentData({
          type: "adjustment",
          quantity: 0,
          reason: "adjustment",
          reference: "",
          notes: "",
        });
        loadInventory();
      }
    } catch (error) {
      console.error('Error adjusting inventory:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your product inventory, stock levels, and restocking
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product and add it to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    placeholder="Enter SKU"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.categoryId}
                    onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Enter product description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProduct}>Create Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(inv => inv.quantityInStock > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(inv => inv.quantityInStock <= inv.lowStockThreshold && inv.quantityInStock > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(inv => inv.quantityInStock <= 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your product inventory and stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const inventoryData = getInventoryData(product.id);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <FallbackImage
                            src={product.images ? JSON.parse(product.images)[0] : '/placeholder.svg'}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            width={40}
                            height={40}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{getStatusBadge(inventoryData)}</TableCell>
                    <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{inventoryData?.quantityInStock || 0}</TableCell>
                    <TableCell>{inventoryData?.quantityReserved || 0}</TableCell>
                    <TableCell>{inventoryData?.quantityAvailable || 0}</TableCell>
                    <TableCell>{inventoryData?.lowStockThreshold || 10}</TableCell>
                    <TableCell>
                      {inventoryData?.lastRestocked 
                        ? new Date(inventoryData.lastRestocked).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsAdjustmentDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inventory Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
            <DialogDescription>
              Adjust stock levels for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Adjustment Type</Label>
              <Select
                value={adjustmentData.type}
                onValueChange={(value) => setAdjustmentData({...adjustmentData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                  <SelectItem value="restock">Restock</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={adjustmentData.quantity}
                onChange={(e) => setAdjustmentData({...adjustmentData, quantity: parseInt(e.target.value) || 0})}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={adjustmentData.reason}
                onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                placeholder="Enter reason"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={adjustmentData.notes}
                onChange={(e) => setAdjustmentData({...adjustmentData, notes: e.target.value})}
                placeholder="Enter notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInventoryAdjustment}>
              Adjust Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
