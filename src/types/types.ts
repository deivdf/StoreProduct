import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number().min(1),
  title: z.string().min(2).max(100),
  price: z.number().min(0),
  description: z.string().min(2).max(1000),
  category: z.string().min(2).max(100),
  image: z.string().url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().nonnegative(),
  }),
});

export const ProductsSchema = z.array(ProductSchema);

export type Product = z.infer<typeof ProductSchema>;
export type Products = z.infer<typeof ProductsSchema>;
