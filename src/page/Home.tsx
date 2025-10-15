import { Button } from "@/components/ui/button";
import { CardProduct } from "./CardProduct";
import { useApi } from "@/hooks/useProduct";
import { ProductsService } from "@/api/products";
import type { Product } from "@/types/types";

function Home() {
  const productsService = new ProductsService();
  const {
    data: products,
    loading,
    error,
    refetch,
  } = useApi(() => productsService.getProducts(), []);

  const handleAddToCart = (product: Product) => {
    console.log("Adding to cart:", product.title);
    // Here you would implement your cart logic
  };

  const handleProductClick = (product: Product) => {
    console.log("Product clicked:", product.title);
    // Here you would implement navigation to product detail
  };

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Store Product</h1>
          <p className="text-muted-foreground">
            Discover amazing products at great prices
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <CardProduct
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
            />
          ))}
        </div>

        {products && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
