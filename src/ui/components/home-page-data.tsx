"use client";

import RollingGallery from "@/ui/components/rolling-gallery";
import Masonry from "@/ui/components/masonry";
import { Button } from "@/ui/primitives/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

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

// Function to generate random heights for masonry layout
const generateRandomHeight = () => {
  const heights = [200, 250, 300, 350, 400, 450, 500, 550, 600];
  return heights[Math.floor(Math.random() * heights.length)];
};

// Function to determine what information to show based on height
const getProductInfoLevel = (height: number) => {
  if (height <= 250) return 'minimal'; // Just name and price
  if (height <= 350) return 'basic'; // Name, price, category
  if (height <= 450) return 'standard'; // Name, price, category, rating
  if (height <= 550) return 'detailed'; // Name, price, category, rating, manufacturer
  return 'full'; // All information including description
};

export function HomePageData({ categories, featuredProducts }: HomePageDataProps) {
  // Use media query to determine if we're on mobile or larger screens
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Limit items based on screen size: 6 for mobile, 15 for medium+ screens
  const maxItems = isMobile ? 6 : 15;
  const limitedProducts = featuredProducts.slice(0, maxItems);
  
  // Transform products into masonry items with random heights
  const masonryItems = limitedProducts.map((product) => {
    const height = generateRandomHeight();
    const infoLevel = getProductInfoLevel(height);
    
    return {
      id: product.id,
      img: JSON.parse(product.images)[0] || "/placeholder.svg",
      url: `/products/${product.slug}`,
      height,
      product,
      infoLevel
    };
  });

  return (
    <>
      {/* Featured Categories - Rolling Gallery */}
      <section className="py-12 md:py-16 w-full">
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
        </div>
        {/* Full-width rolling gallery */}
        <div className="w-full">
          <RollingGallery
            autoplay
            pauseOnHover
            items={categories.map((c) => ({ 
              src: c.image || "/placeholder.svg", 
              name: c.name,
              slug: c.slug 
            }))}
          />
        </div>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex justify-center">
            <Link href="/products">
              <Button className="group h-10 px-6" size="lg" variant="outline">
                Browse All Categories
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products - Masonry Layout */}
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
          
          {/* Masonry Layout */}
          <div className="relative w-full">
            <Masonry
              items={masonryItems}
              ease="power3.out"
              duration={0.6}
              stagger={0.05}
              animateFrom="bottom"
              scaleOnHover={true}
              hoverScale={0.95}
              blurToFocus={true}
              colorShiftOnHover={false}
            />
          </div>
          
          <div className={`${isMobile ? 'mt-4' : 'mt-6'} flex justify-center`}>
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
