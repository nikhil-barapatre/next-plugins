import { Customer as PrismaCustomer } from '@prisma/client'

// Client-safe customer type
export type Customer = PrismaCustomer

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
export interface GetCustomersParams {
  page?: number
  pageSize?: number
  search?: string
}

// Component props
export interface CustomerListProps {
  data: Customer[]
  pagination: PaginationMeta
}
