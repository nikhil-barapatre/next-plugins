'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

import type { Customer, PaginationMeta } from '../_types'
import { getCustomers } from '../_lib/api-client'

import CustomerList from './customer-list'
import { Input } from '@/components/ui/input'
import PaginationControls from '@/components/ui/pagination-controls'

interface CustomersClientPageProps {
  initialCustomers: Customer[]
  initialPagination: PaginationMeta
}

export default function CustomersClientPage({ 
  initialCustomers, 
  initialPagination 
}: CustomersClientPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const createQueryString = useCallback(
    (currentSearchParams: URLSearchParams, params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(currentSearchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }
      return newSearchParams.toString()
    },
    []
  )

  const handleDeleteSuccess = (customerId: string) => {
    setCustomers((prevCustomers) => prevCustomers.filter((c) => c.id !== customerId))
  }

  // Effect to update URL when search term changes
  useEffect(() => {
    const newQuery = createQueryString(searchParams, {
      search: debouncedSearch,
      page: 1, // Reset to page 1 for new search
    });
    // Only push if the query string changes to avoid loops
    if (newQuery !== searchParams.toString()) {
      router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams, createQueryString]);

  // Effect to fetch data when searchParams change
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          search: searchParams.get('search') || '',
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        };
        const { customers, pagination } = await getCustomers(params);
        setCustomers(customers);
        setPagination(pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      setIsLoading(false);
    };

    // We have initial data, but we should fetch if search params are different
    // from what the initial data represents, or if the user navigates.
    // A simple approach is to always fetch when searchParams change.
    fetchCustomers();
  }, [searchParams]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input 
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80"
        />
      </div>

      {isLoading ? (
        <div className="text-center">Loading customers...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
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
