"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/cn";

interface FallbackImageProps {
  alt: string;
  className?: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  sizes?: string;
  src?: string | null;
  width?: number;
  height?: number;
}

export function FallbackImage({
  alt,
  className,
  fill,
  loading = "lazy",
  sizes,
  src,
  width,
  height,
}: FallbackImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  if (!src || imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/50",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="h-8 w-8" />
          <span className="text-xs font-medium">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-muted/30",
            fill ? "absolute inset-0" : "",
            className
          )}
          style={!fill ? { width, height } : undefined}
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <Image
        alt={alt}
        className={cn(
          "object-cover transition-opacity duration-300",
          imageLoading ? "opacity-0" : "opacity-100",
          className
        )}
        fill={fill}
        height={height}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
        src={src}
        width={width}
      />
    </>
  );
}




