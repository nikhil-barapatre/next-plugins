'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

import ProductList from './product-list'
import ProductTableControls from './product-table-controls'
import { Product, PaginationMeta as Pagination } from '../_types'
import { getProducts } from '../_lib/api-client'
import PaginationControls from '@/components/ui/pagination-controls'

interface ProductsClientPageProps {
  products: Product[]
  pagination: Pagination
  distinctCategories: string[]
  distinctStatuses: string[]
}

const getInitialState = (key: string, defaultValue: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || defaultValue
  }
  return defaultValue
}

export default function ProductsClientPage(props: ProductsClientPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>(props.products)
  const [pagination, setPagination] = useState<Pagination>(props.pagination)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState(
    getInitialState('product_search', searchParams.get('search') || '')
  )
  const [category, setCategory] = useState(
    getInitialState('product_category', searchParams.get('category') || '')
  )
  const [status, setStatus] = useState(
    getInitialState('product_status', searchParams.get('status') || '')
  )

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    localStorage.setItem('product_search', search)
  }, [search])

  useEffect(() => {
    localStorage.setItem('product_category', category)
  }, [category])

  useEffect(() => {
    localStorage.setItem('product_status', status)
  }, [status])

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '') {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }
      return newSearchParams.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category') || '';
    const currentStatus = searchParams.get('status') || '';

    if (debouncedSearch !== currentSearch || category !== currentCategory || status !== currentStatus) {
        const newQuery = createQueryString({
          search: debouncedSearch,
          category: category,
          status: status,
          page: 1, // Reset to page 1 on filter change
        });
        router.push(`${pathname}?${newQuery}`, { scroll: false });
    }
  }, [debouncedSearch, category, status, createQueryString, pathname, router, searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const params = {
          search: searchParams.get('search') || '',
          categories: searchParams.get('category')
            ? [searchParams.get('category')!]
            : undefined,
          statuses: searchParams.get('status')
            ? (
                [searchParams.get('status')!] as (
                  | 'DRAFT'
                  | 'ACTIVE'
                  | 'ARCHIVED'
                )[]
              )
            : undefined,
          page: searchParams.get('page')
            ? Number(searchParams.get('page'))
            : 1,
        }
        const { products, pagination } = await getProducts(params)
        setProducts(products)
        setPagination(pagination)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
      }
      setIsLoading(false)
    }
    fetchProducts()
  }, [searchParams])

  const handleDeleteSuccess = () => {
    router.refresh()
  }

  return (
    <div>
      <ProductTableControls
        distinctCategories={props.distinctCategories}
        distinctStatuses={props.distinctStatuses}
        search={search}
        category={category}
        status={status}
        setSearch={setSearch}
        setCategory={setCategory}
        setStatus={setStatus}
      />
      {isLoading ? (
        <div className="text-center">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : (
        <ProductList data={products} onDeleteSuccess={handleDeleteSuccess} />
      )}
      <PaginationControls pagination={pagination} isLoading={isLoading} />
    </div>
  )
}
