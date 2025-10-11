"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart } from "@/lib/hooks/use-cart";
import { Button } from "@/ui/primitives/button";
import { Separator } from "@/ui/primitives/separator";

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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProductDetailClientProps {
  product: Product;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-GH", {
  currency: "GHS",
  style: "currency",
});

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  const images = JSON.parse(product.images);
  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleQuantityChange = React.useCallback((newQty: number) => {
    setQuantity((prev) => (newQty >= 1 ? newQty : prev));
  }, []);

  const handleAddToCart = React.useCallback(async () => {
    setIsAdding(true);
    addItem(
      {
        category: product.categoryName || "Uncategorized",
        id: product.id,
        image: images[0] || "/placeholder.svg",
        name: product.name,
        price: price,
      },
      quantity,
    );
    setQuantity(1);
    toast.success(`${product.name} added to cart`);
    await new Promise((r) => setTimeout(r, 400));
    setIsAdding(false);
  }, [addItem, product, quantity, price, images]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          {/* Back link */}
          <Button
            aria-label="Back to products"
            className="mb-6"
            onClick={() => router.push("/products")}
            variant="ghost"
          >
            ← Back to Products
          </Button>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Product image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                alt={product.name}
                className="object-cover"
                fill
                priority
                src={images[0] || "/placeholder.svg"}
              />
              {discountPercentage > 0 && (
                <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  -{discountPercentage}%
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col">
              {/* Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="mt-2 text-lg font-medium text-muted-foreground">
                  {product.categoryName || "Uncategorized"}
                </p>
              </div>

              {/* Prices */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    {CURRENCY_FORMATTER.format(price)}
                  </span>
                  {originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {CURRENCY_FORMATTER.format(originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="mb-6 text-muted-foreground">
                {product.description || product.shortDescription || "No description available."}
              </p>

              {/* SKU */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
                {product.manufacturer && (
                  <p className="text-sm text-muted-foreground">
                    Manufacturer: {product.manufacturer}
                  </p>
                )}
              </div>

              {/* Quantity selector & Add to cart */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Quantity */}
                <div className="flex items-center">
                  <Button
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    size="icon"
                    variant="outline"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-12 text-center select-none">
                    {quantity}
                  </span>

                  <Button
                    aria-label="Increase quantity"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to cart */}
                <Button
                  className="flex-1"
                  disabled={isAdding}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isAdding ? "Adding…" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Additional images */}
          {images.length > 1 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Additional Images</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image
                      alt={`${product.name} - Image ${index + 2}`}
                      className="object-cover"
                      fill
                      src={image}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product details */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Product Information */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Product Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="font-medium">SKU</span>
                  <span className="text-muted-foreground">{product.sku}</span>
                </div>
                {product.barcode && (
                  <div className="flex justify-between border-b pb-2 text-sm">
                    <span className="font-medium">Barcode</span>
                    <span className="text-muted-foreground">{product.barcode}</span>
                  </div>
                )}
                {product.manufacturer && (
                  <div className="flex justify-between border-b pb-2 text-sm">
                    <span className="font-medium">Manufacturer</span>
                    <span className="text-muted-foreground">{product.manufacturer}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="font-medium">Category</span>
                  <span className="text-muted-foreground">{product.categoryName || "Uncategorized"}</span>
                </div>
              </div>
            </section>

            {/* Related Products */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
              <p className="text-muted-foreground">
                Browse more products in the {product.categoryName || "same"} category.
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href={`/products?category=${product.categoryId}`}>
                  View All {product.categoryName || "Products"}
                </Link>
              </Button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
