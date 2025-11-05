import { getProducts, getDistinctCategories, getDistinctStatuses } from '@/lib/server/products'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductOverviewCards from './_components/product-overview-cards'
import ProductsClientPage from './_components/products-client-page'
import { ProductSearchParams } from './_types'
import { Suspense } from 'react'

interface ProductsPageProps {
  searchParams: ProductSearchParams
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize, 10) : 10;
  const search = searchParams.search || '';
  const categories = searchParams.categories ? searchParams.categories.split(',') : undefined;
  const statuses = searchParams.statuses ? searchParams.statuses.split(',') as Array<'DRAFT' | 'ACTIVE' | 'ARCHIVED'> : undefined;

  const { products, pagination } = await getProducts({ page, pageSize, search, categories, statuses });
  const distinctCategories = await getDistinctCategories()
  const distinctStatuses = await getDistinctStatuses()

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>

      <ProductOverviewCards products={products} pagination={pagination} />

      <Suspense fallback={<div>Loading...</div>}>
        <ProductsClientPage
          products={products}
          pagination={pagination}
          distinctCategories={distinctCategories}
          distinctStatuses={distinctStatuses}
        />
      </Suspense>
    </div>

  )
}
