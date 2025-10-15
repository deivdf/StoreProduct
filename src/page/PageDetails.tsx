import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useProduct";
import { ProductsService } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";

function ProductDetailSkeleton() {
  return (
    <div className="min-h-svh p-6">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: product,
    loading,
    error,
    refetch,
  } = useApi(() => ProductsService.getProductById(Number(id)), [id]);

  const handleAddToCart = () => {
    console.log("Adding to cart:", product?.title);
  };

  const handleBuyNow = () => {
    console.log("Buy now:", product?.title);
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-muted-foreground mb-4">Product not found</div>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-svh p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center bg-white rounded-lg p-8">
            <img
              src={product.image}
              alt={product.title}
              className="max-w-full h-auto max-h-96 object-contain"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-semibold">
                  {product.rating.rate}
                </span>
              </div>
              <span className="text-muted-foreground">
                ({product.rating.count} reviews)
              </span>
            </div>

            <div className="text-4xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </div>

            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 mt-4">
              <Button size="lg" onClick={handleBuyNow}>
                Buy Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium text-green-600">In Stock</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product ID</span>
                    <span className="font-medium">#{product.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
