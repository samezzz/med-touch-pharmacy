"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/hooks/use-cart";
import { ProductCard } from "@/ui/components/product-card";
import { FallbackImage } from "@/ui/components/fallback-image";
import { Button } from "@/ui/primitives/button";
import { Input } from "@/ui/primitives/input";
import { Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  originalPrice: string | null;
  sku: string;
  barcode: string | null;
  images: string;
  isActive: boolean;
  isFeatured: boolean;
  manufacturer: string | null;
  categoryId: string;
  categoryName: string | null;
  quantityAvailable: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface ProductsPageClientProps {
  initialProducts: Product[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function ProductsPageClient({ initialProducts, initialPagination }: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const { addItem: _addItem } = useCart();
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [pagination, setPagination] = React.useState(initialPagination);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get("category") || "all");
  const [categories, setCategories] = React.useState<Category[]>([]);

  const currentCategory = searchParams.get("category") || "all";
  const currentSearch = searchParams.get("search") || "";

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when search or category changes
  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== "all") {
          params.set("category", currentCategory);
        }
        if (currentSearch) {
          params.set("search", currentSearch);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        
        if (data.products) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    window.history.pushState(null, "", `?${params.toString()}`);
  };


  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {currentCategory !== "all" ? `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Products` : "All Products"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {pagination.total} products found
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            key="all"
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
                image: (() => {
                  try {
                    const images = JSON.parse(product.images);
                    return Array.isArray(images) && images.length > 0 ? images[0] : "/placeholder.svg";
                  } catch {
                    return "/placeholder.svg";
                  }
                })(),
                category: product.categoryName || "Uncategorized",
                inStock: (product.quantityAvailable || 0) > 0,
                rating: 0,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FallbackImage
            src="/placeholder.svg"
            alt="No products found"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            window.history.pushState(null, "", "/products");
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("page", (pagination.page - 1).toString());
                window.history.pushState(null, "", `?${params.toString()}`);
              }}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("page", (pagination.page + 1).toString());
                window.history.pushState(null, "", `?${params.toString()}`);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
