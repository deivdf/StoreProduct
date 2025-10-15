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

interface PaginationOptions {
  limit?: number;
  sort?: "asc" | "desc";
}

interface FilterOptions extends PaginationOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}

export class ProductsService {
  private static productsCache: Map<string, CacheItem<Products>> = new Map();
  private static productCache: Map<number, CacheItem<Product>> = new Map();
  private static categoriesCache: CacheItem<string[]> | null = null;

  private static CACHE_TTL = 5 * 60 * 1000;

  private static isCacheValid<T>(
    cacheItem: CacheItem<T> | undefined | null,
  ): boolean {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < this.CACHE_TTL;
  }

  private static generateCacheKey(options: FilterOptions): string {
    const {
      limit = "all",
      sort = "none",
      category = "all",
      minPrice = "none",
      maxPrice = "none",
      searchTerm = "none",
    } = options;
    return `products_limit${limit}_sort${sort}_cat${category}_min${minPrice}_max${maxPrice}_search${searchTerm}`;
  }

  private static filterProducts(
    products: Product[],
    filters: FilterOptions,
  ): Product[] {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term),
      );
    }

    if (filters.sort) {
      filtered.sort((a, b) => {
        if (filters.sort === "asc") {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  async getProducts(): Promise<Products> {
    const cacheKey = "all_products";
    const cachedData = ProductsService.productsCache.get(cacheKey);

    if (ProductsService.isCacheValid(cachedData)) {
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

  static async getProductsWithLimit(
    options: PaginationOptions = {},
  ): Promise<Products> {
    const { limit, sort } = options;
    const cacheKey = this.generateCacheKey(options);
    const cachedData = this.productsCache.get(cacheKey);

    if (this.isCacheValid(cachedData)) {
      return cachedData!.data;
    }

    try {
      let url = "/products";
      const params = new URLSearchParams();

      if (limit) {
        params.append("limit", limit.toString());
      }
      if (sort) {
        params.append("sort", sort);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const products = await validateResponse(api.get(url), ProductsSchema);

      this.productsCache.set(cacheKey, {
        data: products,
        timestamp: Date.now(),
      });

      return products;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${handleApiError(error)}`);
    }
  }

  static async getProductsFiltered(
    filters: FilterOptions = {},
  ): Promise<Products> {
    const cacheKey = this.generateCacheKey(filters);
    const cachedData = this.productsCache.get(cacheKey);

    if (this.isCacheValid(cachedData)) {
      return cachedData!.data;
    }

    try {
      let products: Product[];

      if (filters.category) {
        const response = await api.get(
          `/products/category/${filters.category}`,
        );
        products = response.data;
      } else {
        const response = await api.get("/products");
        products = response.data;
      }

      const filteredProducts = this.filterProducts(products, filters);

      this.productsCache.set(cacheKey, {
        data: filteredProducts,
        timestamp: Date.now(),
      });

      return filteredProducts;
    } catch (error) {
      throw new Error(
        `Failed to fetch filtered products: ${handleApiError(error)}`,
      );
    }
  }

  static async getProductsByCategory(
    category: string,
    options: PaginationOptions = {},
  ): Promise<Products> {
    const cacheKey = this.generateCacheKey({ ...options, category });
    const cachedData = this.productsCache.get(cacheKey);

    if (this.isCacheValid(cachedData)) {
      console.log(`Returning products from category ${category} from cache`);
      return cachedData!.data;
    }

    try {
      let url = `/products/category/${category}`;
      const params = new URLSearchParams();

      if (options.limit) {
        params.append("limit", options.limit.toString());
      }
      if (options.sort) {
        params.append("sort", options.sort);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      const products = response.data;

      this.productsCache.set(cacheKey, {
        data: products,
        timestamp: Date.now(),
      });

      return products;
    } catch (error) {
      throw new Error(
        `Failed to fetch products from category ${category}: ${handleApiError(error)}`,
      );
    }
  }

  static async getCategories(): Promise<string[]> {
    if (this.isCacheValid(this.categoriesCache)) {
      return this.categoriesCache!.data;
    }

    try {
      const response = await api.get("/products/categories");
      const categories = response.data;

      this.categoriesCache = {
        data: categories,
        timestamp: Date.now(),
      };

      return categories;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${handleApiError(error)}`);
    }
  }

  static async getProductById(id: number): Promise<Product> {
    const cachedData = this.productCache.get(id);

    if (this.isCacheValid(cachedData)) {
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

  static paginateClientSide(
    products: Product[],
    page: number = 1,
    itemsPerPage: number = 10,
  ) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    return {
      data: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: products.length,
        itemsPerPage: itemsPerPage,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static clearCache(): void {
    this.productsCache.clear();
    this.productCache.clear();
    this.categoriesCache = null;
  }

  static invalidateProduct(id: number): void {
    this.productCache.delete(id);
    this.productsCache.clear();
  }

  static invalidateProducts(): void {
    this.productsCache.clear();
  }

  static invalidateCategories(): void {
    this.categoriesCache = null;
  }

  static setCacheTTL(milliseconds: number): void {
    this.CACHE_TTL = milliseconds;
  }
}
