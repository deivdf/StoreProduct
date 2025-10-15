import axios, { type AxiosResponse } from "axios";
import { z } from "zod";

export const api = axios.create({
  baseURL: "https://fakestoreapi.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function validateResponse<T>(
  promise: Promise<AxiosResponse>,
  schema: z.ZodSchema<T>,
): Promise<T> {
  try {
    const response = await promise;
    const validatedData = schema.parse(response.data);
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error", error.message);
      throw new Error("Invalid response");
    }
    throw error;
  }
}
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message || error.message || "API Error occurred"
    );
  }
  return error instanceof Error ? error.message : "Unknown error occurred";
}
