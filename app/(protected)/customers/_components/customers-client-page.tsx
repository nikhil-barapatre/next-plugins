'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

import type { Customer, PaginationMeta } from '../_types'
import { getCustomers } from '../_lib/api-client'

import CustomerList from './customer-list'
import { Input } from '@/components/ui/input'
import PaginationControls from '@/components/ui/pagination-controls'
import { Button } from '@/components/ui/button'
import CustomerFormDialog from './customer-form-dialog'

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
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const isInitialMount = useRef(true);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const fetchCustomers = useCallback(async () => {
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
  }, [searchParams]);

  const handleDeleteSuccess = (customerId: string) => {
    setCustomers((prevCustomers) => prevCustomers.filter((c) => c.id !== customerId))
    fetchCustomers(); // Refetch to update pagination meta
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchCustomers(); // Refetch data to show the new/updated customer
  }

  // Effect to update URL when search term changes
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const newQuery = createQueryString({
        search: debouncedSearch,
        page: 1, // Reset to page 1 for new search
      });
      router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams, createQueryString]);

  // Effect to fetch data when searchParams change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const load = async () => {
      await fetchCustomers();
    };

    load();
  }, [searchParams, fetchCustomers]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80"
        />
        <Button onClick={() => setIsFormOpen(true)}>Create Customer</Button>
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
