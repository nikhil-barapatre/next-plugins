// app/(protected)/products/_lib/api-client.ts
import type { ApiResponse, GetProductsParams, PaginationMeta, Product } from '../_types/index'
import type { ProductFormData } from '../_validations/product'
const PRODUCTS_API_PATH = '/api/products';

// Client-side API functions for components
export async function getProducts(params: GetProductsParams = {}): Promise<{
  products: Product[]
  pagination: PaginationMeta
}> {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','))
      } else {
        queryParams.set(key, String(value))
      }
    }
  })

  const response = await fetch(`${PRODUCTS_API_PATH}?${queryParams}`)
  const result: ApiResponse<Product[]> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch products')
  }

  return {
    products: result.data || [],
    pagination: result.meta || { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  }
}

export async function getProductById(productId: string): Promise<Product> {
  const response = await fetch(`${PRODUCTS_API_PATH}?id=${productId}`)
  const result: ApiResponse<Product> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to fetch product')
  }

  return result.data
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await fetch(PRODUCTS_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Product> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to create product')
  }

  return result.data
}

export async function updateProduct(productId: string, data: ProductFormData): Promise<Product> {
  const response = await fetch(`${PRODUCTS_API_PATH}?id=${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Product> = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to update product')
  }

  return result.data
}

export async function deleteProduct(productId: string): Promise<void> {
  const response = await fetch(`${PRODUCTS_API_PATH}?id=${productId}`, {
    method: 'DELETE',
  })

  if (response.status === 204) {
    return
  }

  const result: ApiResponse<void> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete product')
  }
}

export type { Product };
