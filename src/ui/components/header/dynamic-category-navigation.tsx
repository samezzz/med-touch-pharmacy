"use client";

import { useEffect, useState } from "react";
import { Baby, Heart, Pill, Stethoscope, Syringe, Tablet, TestTube, Utensils, Shield, Eye, Brain, Activity } from "lucide-react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/ui/primitives/navigation-menu";
import { cn } from "@/lib/cn";

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

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  prescriptions: Syringe,
  medicines: Pill,
  vitamins: Tablet,
  supplements: TestTube,
  devices: Stethoscope,
  "mother & baby": Baby,
  toiletries: Utensils,
  health: Heart,
  wellness: Activity,
  "personal care": Shield,
  "eye care": Eye,
  "mental health": Brain,
  fitness: Activity,
};

export function DynamicCategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4">Loading categories...</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.slug] || Pill;
                return (
                  <NavigationMenuLink key={category.id} asChild>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <div className="text-sm font-medium leading-none">
                          {category.name}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {category.description || `${category.productCount} products available`}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                );
              })}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
