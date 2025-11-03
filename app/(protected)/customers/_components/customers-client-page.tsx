'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

import type { Customer, PaginationMeta, CustomerStats } from '../_types'
import { getCustomers, getCustomerStats } from '../_lib/api-client'

import CustomerList from './customer-list'
import { Input } from '@/components/ui/input'
import PaginationControls from '@/components/ui/pagination-controls'
import { Button } from '@/components/ui/button'
import CustomerFormDialog from './customer-form-dialog'
import CustomerOverviewCards from './customer-overview-cards'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomersClientPageProps {
  initialCustomers: Customer[]
  initialPagination: PaginationMeta
  distinctStatuses: string[]
}

const getInitialState = (key: string, defaultValue: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || defaultValue
  }
  return defaultValue
}

export default function CustomersClientPage({
  initialCustomers,
  initialPagination,
  distinctStatuses,
}: CustomersClientPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination)
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState(
    getInitialState('customer_search', searchParams.get('search') || '')
  )
  const [status, setStatus] = useState(
    getInitialState('customer_status', searchParams.get('status') || '')
  )
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    localStorage.setItem('customer_search', searchTerm)
  }, [searchTerm])

  useEffect(() => {
    localStorage.setItem('customer_status', status)
  }, [status])

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== '') {
          newSearchParams.set(key, String(value))
        }
      }
      return newSearchParams.toString()
    },
    []
  )

  const handleReset = () => {
    setSearchTerm('')
    setStatus('')
  }

  // Effect to update URL when search term or status changes
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || '';

    if (debouncedSearch !== currentSearch || status !== currentStatus) {
      const newQuery = createQueryString({
        search: debouncedSearch,
        status: status,
        page: 1, // Reset to page 1 for new search/filter
      });
      router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [debouncedSearch, status, pathname, router, searchParams, createQueryString]);

  // Effect to fetch data when searchParams change
  useEffect(() => {
    const fetchCustomersAndStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          search: searchParams.get('search') || '',
          status: searchParams.get('status') || '',
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        };
        const [{ customers, pagination }, stats] = await Promise.all([
          getCustomers(params),
          getCustomerStats(),
        ]);
        setCustomers(customers);
        setPagination(pagination);
        setStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      setIsLoading(false);
    };

    fetchCustomersAndStats();
  }, [searchParams]);

  const handleDeleteSuccess = (customerId: string) => {
    setCustomers((prevCustomers) => prevCustomers.filter((c) => c.id !== customerId))
    // Refetch to update pagination meta
    const fetchCustomersAndStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          search: searchParams.get('search') || '',
          status: searchParams.get('status') || '',
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        };
        const [{ customers, pagination }, stats] = await Promise.all([
          getCustomers(params),
          getCustomerStats(),
        ]);
        setCustomers(customers);
        setPagination(pagination);
        setStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      setIsLoading(false);
    };

    fetchCustomersAndStats()
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    // Refetch data to show the new/updated customer
    const fetchCustomersAndStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          search: searchParams.get('search') || '',
          status: searchParams.get('status') || '',
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        };
        const [{ customers, pagination }, stats] = await Promise.all([
          getCustomers(params),
          getCustomerStats(),
        ]);
        setCustomers(customers);
        setPagination(pagination);
        setStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      setIsLoading(false);
    };

    fetchCustomersAndStats()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => setIsFormOpen(true)}>Create Customer</Button>
      </div>

      <CustomerOverviewCards stats={stats} />

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {distinctStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>

      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />

      {isLoading ? (
        <div className="text-center">Loading customers...</div>
      ) : error ? (
        <div className="text-center">Error: {error}</div>
      ) : (
        <CustomerList data={customers} onDeleteSuccess={handleDeleteSuccess} />
      )}

      <PaginationControls
        pagination={pagination}
        isLoading={isLoading}
      />
    </div>
  )
}
