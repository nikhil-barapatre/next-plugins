import { Product as PrismaProduct } from '@prisma/client'

export type Product = Omit<PrismaProduct, 'price' | 'discounted_price' | 'status'> & {
  price: string
  discounted_price: string | null
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null
}

import { ZodIssue } from 'zod'

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: ZodIssue[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
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
  statuses?: Array<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface ProductSearchParams {
  page?: string;
  pageSize?: string;
  search?: string;
  categories?: string;
  statuses?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductListProps {
  data: Product[]
  pagination: PaginationMeta
  onDeleteSuccess: (productId: string) => void
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
  statuses: Array<{ value: string; label: string }>}

export  interface ProductsPageProps {
    searchParams: ProductSearchParams
  }

export interface ProductFormProps {
  product?: Product
}

export interface ProductOverviewCardsProps {
  products: Product[]
  pagination: PaginationMeta
}

export interface ProductTableControlsProps {
  distinctCategories: string[]
  distinctStatuses: string[]
  search: string
  category: string
  status: string
  setSearch: (value: string) => void
  setCategory: (value: string) => void
  setStatus: (value: string) => void
}

export interface ProductsClientPageProps {
  products: Product[]
  pagination: PaginationMeta
  distinctCategories: string[]
  distinctStatuses: string[]
}