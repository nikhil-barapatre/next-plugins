import { getProducts, getDistinctCategories, getDistinctStatuses } from './_lib/server-api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductOverviewCards from './_components/product-overview-cards'
import ProductsClientPage from './_components/products-client-page'

export default async function ProductsPage() {
  const { products, pagination } = await getProducts({})
  const distinctCategories = await getDistinctCategories()
  const distinctStatuses = await getDistinctStatuses()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-5">Products</h1>
      <ProductOverviewCards products={products} pagination={pagination} />
      <div className="flex justify-between items-center mb-5">
        <Link href="/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>
      <ProductsClientPage
        products={products}
        pagination={pagination}
        distinctCategories={distinctCategories}
        distinctStatuses={distinctStatuses}
      />
    </div>
  )
}
