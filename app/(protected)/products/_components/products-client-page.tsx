'use client'

import { useState, useEffect, useCallback } from 'react'
import ProductList from './product-list'
import ProductTableControls from './product-table-controls'
import { Product, PaginationMeta as Pagination } from '../_types'
import { getProducts } from '../_lib/api-client'
import { useDebounce } from '@/hooks/useDebounce' // Assuming a debounce hook is available

interface ProductsClientPageProps {
  products: Product[]
  pagination: Pagination
  distinctCategories: string[]
  distinctStatuses: string[]
}

export default function ProductsClientPage(props: ProductsClientPageProps) {
  const [products, setProducts] = useState<Product[]>(props.products)
  const [pagination, setPagination] = useState<Pagination>(props.pagination)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = {
        search: debouncedSearch,
        categories: category ? [category] : undefined,
        statuses: status ? [status] as Array<'DRAFT' | 'ACTIVE' | 'ARCHIVED'> : undefined,
        page: 1, // Reset to page 1 on filter change
      }
      const { products, pagination } = await getProducts(params)
      setProducts(products)
      setPagination(pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
    setIsLoading(false)
  }, [debouncedSearch, category, status])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
        <ProductList data={products} pagination={pagination} />
      )}
    </div>
  )
}

