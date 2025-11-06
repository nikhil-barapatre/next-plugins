import { getProducts, getDistinctCategories, getDistinctStatuses } from '@/lib/server/products'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductOverviewCards from './_components/product-overview-cards'
import ProductsClientPage from './_components/products-client-page'
import { ProductsPageProps } from './_types'
import { Suspense } from 'react'

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 10;
  const search = params.search || '';
  const categories = params.categories ? params.categories.split(',') : undefined;
  const statuses = params.statuses
    ? params.statuses.split(',') as Array<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>
    : undefined;

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
