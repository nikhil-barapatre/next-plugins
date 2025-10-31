'use client'

import { useState } from 'react'
import ProductList from './product-list'
import ProductTableControls from './product-table-controls'
import { Product, PaginationMeta as Pagination } from '../_types'

interface ProductsClientPageProps {
  products: Product[]
  pagination: Pagination
  distinctCategories: string[]
  distinctStatuses: string[]
}

export default function ProductsClientPage({
  products,
  pagination,
  distinctCategories,
  distinctStatuses,
}: ProductsClientPageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')

  const filteredProducts = products.filter((product) => {
    return (
      (search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase())) &&
      (category === '' || product.category === category) &&
      (status === '' || product.status === status)
    )
  })

  return (
    <div>
      <ProductTableControls
        distinctCategories={distinctCategories}
        distinctStatuses={distinctStatuses}
        search={search}
        category={category}
        status={status}
        setSearch={setSearch}
        setCategory={setCategory}
        setStatus={setStatus}
      />
      <ProductList data={filteredProducts} pagination={pagination} />
    </div>
  )
}
