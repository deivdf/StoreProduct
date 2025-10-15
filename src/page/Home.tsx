import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardProduct } from "./CardProduct";
import { useApi } from "@/hooks/useProduct";
import { ProductsService } from "@/api/products";
import type { Product } from "@/types/types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [paginatedData, setPaginatedData] = useState<{
    data: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  } | null>(null);

  const itemsPerPage = 8;
  const productsService = new ProductsService();
  const {
    data: products,
    loading,
    error,
    refetch,
  } = useApi(() => productsService.getProducts(), []);

  useEffect(() => {
    if (products) {
      const result = ProductsService.paginateClientSide(
        products,
        currentPage,
        itemsPerPage,
      );
      setPaginatedData(result);
    }
  }, [products, currentPage]);

  const handleAddToCart = (product: Product) => {
    console.log("Adding to cart:", product.title);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-svh p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
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
          {paginatedData?.data.map((product) => (
            <CardProduct
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
            />
          ))}
        </div>

        {paginatedData && paginatedData.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        )}

        {paginatedData && paginatedData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!paginatedData.pagination.hasPreviousPage}
            >
              Previous
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: paginatedData.pagination.totalPages }).map(
                (_, index) => {
                  const page = index + 1;
                  const isCurrentPage =
                    page === paginatedData.pagination.currentPage;
                  const showPage =
                    page === 1 ||
                    page === paginatedData.pagination.totalPages ||
                    Math.abs(page - paginatedData.pagination.currentPage) <= 1;

                  if (!showPage) {
                    if (
                      page === paginatedData.pagination.currentPage - 2 ||
                      page === paginatedData.pagination.currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="min-w-10"
                    >
                      {page}
                    </Button>
                  );
                },
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!paginatedData.pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
