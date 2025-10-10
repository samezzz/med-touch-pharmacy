"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Eye, Search, Filter, AlertTriangle } from "lucide-react";

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
import { Switch } from "@/ui/primitives/switch";
import { FallbackImage } from "@/ui/components/fallback-image";
import type { AdminUserWithDetails, Product, Category } from "@/db/schema";

interface ProductManagementProps {
  adminUser: AdminUserWithDetails;
}

export function ProductManagement({ }: ProductManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      
      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [searchQuery, selectedCategory]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  const handleCreateProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        images: newProduct.images ? [newProduct.images] : [],
        dimensions: { length: 0, width: 0, height: 0 },
        tags: newProduct.tags ? newProduct.tags.split(',').map(tag => tag.trim()) : [],
        expiryDate: newProduct.expiryDate ? new Date(newProduct.expiryDate) : null,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts([...products, data.product]);
        setNewProduct({
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
        setIsCreateDialogOpen(false);
      } else {
        const error = await response.json();
        console.error('Failed to create product:', error);
        alert('Failed to create product: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProduct),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(products.map(prod =>
          prod.id === editingProduct.id ? data.product : prod
        ));
        setIsEditDialogOpen(false);
        setEditingProduct(null);
      } else {
        const error = await response.json();
        console.error('Failed to update product:', error);
        alert('Failed to update product: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProducts(products.filter(prod => prod.id !== productId));
        } else {
          const error = await response.json();
          console.error('Failed to delete product:', error);
          alert('Failed to delete product: ' + (error.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleToggleActive = async (productId: string) => {
    const product = products.find(prod => prod.id === productId);
    if (!product) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(products.map(prod =>
          prod.id === productId ? data.product : prod
        ));
      } else {
        const error = await response.json();
        console.error('Failed to toggle product status:', error);
        alert('Failed to update product status: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Error updating product status. Please try again.');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and details
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Paracetamol 500mg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                    placeholder="e.g., paracetamol-500mg"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  placeholder="Brief product description"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}>
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
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="e.g., PAR-500-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (GHS)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="15.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="originalPrice">Original Price (GHS)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    placeholder="18.00"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="images">Image URLs (JSON array)</Label>
                <Input
                  id="images"
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  placeholder='["https://example.com/image1.jpg", "https://example.com/image2.jpg"]'
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={newProduct.manufacturer}
                    onChange={(e) => setNewProduct({ ...newProduct, manufacturer: e.target.value })}
                    placeholder="e.g., PharmaCorp"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                    placeholder="10.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newProduct.expiryDate || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={newProduct.batchNumber}
                    onChange={(e) => setNewProduct({ ...newProduct, batchNumber: e.target.value })}
                    placeholder="BATCH-001"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (JSON array)</Label>
                <Input
                  id="tags"
                  value={newProduct.tags}
                  onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                  placeholder='["pain relief", "fever", "otc"]'
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newProduct.isActive}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={newProduct.isFeatured}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, isFeatured: checked })}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresPrescription"
                    checked={newProduct.requiresPrescription}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, requiresPrescription: checked })}
                  />
                  <Label htmlFor="requiresPrescription">Requires Prescription</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProduct}>
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Manage your product inventory and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const images = JSON.parse(product.images || "[]");
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden relative">
                          <FallbackImage
                            src={images[0] ?? null}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCategoryName(product.categoryId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">GHS {product.price}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            GHS {product.originalPrice}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">0</span>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={() => handleToggleActive(product.id)}
                        />
                        <div className="flex flex-col space-y-1">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {product.isFeatured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {product.requiresPrescription && (
                            <Badge variant="destructive" className="text-xs">
                              Rx Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={editingProduct.slug}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editingProduct.categoryId} 
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryId: value })}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editingProduct.isActive}
                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isActive: checked })}
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-featured"
                    checked={editingProduct.isFeatured}
                    onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isFeatured: checked })}
                  />
                  <Label htmlFor="edit-featured">Featured</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
