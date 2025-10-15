import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/types/types";

interface CardProductProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  className?: string;
}

export function CardProduct({
  product,
  onAddToCart,
  onProductClick,
  className,
}: CardProductProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleProductClick = () => {
    onProductClick?.(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electronics:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      jewelery:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "men's clothing":
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "women's clothing":
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border/80 cursor-pointer",
        className,
      )}
      onClick={handleProductClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full capitalize",
              getCategoryColor(product.category),
            )}
          >
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 text-sm leading-5 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </span>

          <Button
            size="sm"
            onClick={handleAddToCart}
            className="flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CardProduct;
