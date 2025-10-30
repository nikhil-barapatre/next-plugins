import { getProducts } from './_lib/server-api'
import ProductList from './_components/product-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductOverviewCards from './_components/product-overview-cards'

export default async function ProductsPage() {
  const { products, pagination } = await getProducts()

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>
      <ProductOverviewCards products={products} pagination={pagination} />
      <ProductList data={products} pagination={pagination} />
    </div>
  )
}
