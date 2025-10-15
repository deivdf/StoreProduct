import { api, validateResponse, handleApiError } from "../lib/api";
import {
  type Product,
  ProductsSchema,
  type Products,
  ProductSchema,
} from "../types/types";

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class ProductsService {
  private static productsCache: Map<string, CacheItem<Products>> = new Map();
  private static productCache: Map<number, CacheItem<Product>> = new Map();

  private static CACHE_TTL = 5 * 60 * 1000;

  private static isCacheValid<T>(cacheItem: CacheItem<T> | undefined): boolean {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < this.CACHE_TTL;
  }

  async getProducts(): Promise<Products> {
    const cacheKey = "all_products";
    const cachedData = ProductsService.productsCache.get(cacheKey);

    if (ProductsService.isCacheValid(cachedData)) {
      console.log("Returning products from cache");
      return cachedData!.data;
    }

    try {
      const products = await validateResponse(
        api.get("/products"),
        ProductsSchema,
      );

      ProductsService.productsCache.set(cacheKey, {
        data: products,
        timestamp: Date.now(),
      });

      return products;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${handleApiError(error)}`);
    }
  }

  static async getProductById(id: number): Promise<Product> {
    const cachedData = this.productCache.get(id);

    if (this.isCacheValid(cachedData)) {
      console.log(`Returning product ${id} from cache`);
      return cachedData!.data;
    }

    try {
      const product = await validateResponse(
        api.get(`/products/${id}`),
        ProductSchema,
      );

      this.productCache.set(id, {
        data: product,
        timestamp: Date.now(),
      });

      return product;
    } catch (error) {
      throw new Error(
        `Failed to fetch product ${id}: ${handleApiError(error)}`,
      );
    }
  }

  static clearCache(): void {
    this.productsCache.clear();
    this.productCache.clear();
    console.log("Cache cleared");
  }

  static invalidateProduct(id: number): void {
    this.productCache.delete(id);
    this.productsCache.clear();
  }

  static invalidateProducts(): void {
    this.productsCache.clear();
  }

  static setCacheTTL(milliseconds: number): void {
    this.CACHE_TTL = milliseconds;
  }
}
