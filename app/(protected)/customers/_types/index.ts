import { Customer as PrismaCustomer } from '@prisma/client'

export type Customer = PrismaCustomer

// Pagination types
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface CustomerStats {
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    inactiveCustomers: number;
  }

// API parameters
export interface GetCustomersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

// Component props
export interface CustomerListProps {
  data: Customer[]
  pagination: PaginationMeta
  onDeleteSuccess: (customerId: string) => void
}

export interface CustomersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  onSuccess: () => void
}

export interface CustomerFormProps {
  customer?: Customer
  onSuccess: () => void
}

export interface CustomersClientPageProps {
  initialCustomers: Customer[]
  initialPagination: PaginationMeta
  distinctStatuses: string[]
}
