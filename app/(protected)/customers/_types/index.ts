import { Customer as PrismaCustomer } from '@prisma/client'

export type Customer = PrismaCustomer

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