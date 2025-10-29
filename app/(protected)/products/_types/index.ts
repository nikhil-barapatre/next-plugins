// app/(protected)/products/_types/index.ts
import { Product as PrismaProduct } from '@prisma/client'

// Client-safe product type (Decimal -> string conversion)
export type Product = Omit<PrismaProduct, 'price' | 'discounted_price'> & {
  price: string
  discounted_price: string | null
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  meta?: Record<string, unknown>
}

// Pagination types
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// API parameters
export interface GetProductsParams {
  page?: number
  pageSize?: number
  search?: string
  categories?: string[]
  statuses?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

// Form data types

// Component props
export interface ProductListProps {
  data: Product[]
  pagination: PaginationMeta
}

export interface PaginationData {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface ProductFilters {
  categories: string[]
  statuses: Array<{ value: string; label: string }>
}
