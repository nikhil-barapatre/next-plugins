// app/(protected)/products/_lib/api-client.ts
import type { ApiResponse, GetProductsParams, PaginationMeta, Product } from '../_types/index'
import type { ProductFormData } from '../_validations/product'

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

  const response = await fetch(`/api/products?${queryParams}`)
  const result: ApiResponse<{ products: Product[]; pagination: PaginationMeta }> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch products')
  }

  return result.data
}

export async function getProductById(productId: string): Promise<Product> {
  const response = await fetch(`/api/products?id=${productId}`)
  const result: ApiResponse<Product> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch product')
  }

  return result.data as Product
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Product> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to create product')
  }

  return result.data
}

export async function updateProduct(productId: string, data: ProductFormData): Promise<Product> {
  const response = await fetch(`/api/products?id=${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result: ApiResponse<Product> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to update product')
  }

  return result.data
}

export async function deleteProduct(productId: string): Promise<void> {
  const response = await fetch(`/api/products?id=${productId}`, {
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
