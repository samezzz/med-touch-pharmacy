"use client";

import { ProductCard } from "@/ui/components/product-card";
import { FallbackImage } from "@/ui/components/fallback-image";
import { Button } from "@/ui/primitives/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  productCount: number;
}

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
  inStock: boolean;
  rating: number | null;
  manufacturer: string | null;
  categoryId: string;
  categoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface HomePageDataProps {
  categories: Category[];
  featuredProducts: Product[];
}

export function HomePageData({ categories, featuredProducts }: HomePageDataProps) {
  return (
    <>
      {/* Featured Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              Shop by Category
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
              Browse our comprehensive range of pharmacy products organized by category
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((category) => (
              <Link
                aria-label={`Browse ${category.name} products`}
                className="group relative flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card shadow transition-all duration-300 hover:shadow-lg"
                href={`/products?category=${category.slug}`}
                key={category.id}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
                  <FallbackImage
                    alt={category.name}
                    className="object-cover transition duration-300 group-hover:scale-105"
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    src={category.image || "/placeholder.svg"}
                  />
                </div>
                <div className="relative z-20 -mt-6 p-4">
                  <div className="mb-1 text-lg font-medium">{category.name}</div>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount} products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              Featured Products
            </h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
              Check out our latest and most popular pharmacy products
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  id: product.id,
                  name: product.name,
                  price: parseFloat(product.price),
                  originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
                  image: JSON.parse(product.images)[0] || "/placeholder.svg",
                  category: product.categoryName || "Uncategorized",
                  inStock: product.inStock,
                  rating: product.rating || 0,
                }}
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/products">
              <Button className="group h-12 px-8" size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
