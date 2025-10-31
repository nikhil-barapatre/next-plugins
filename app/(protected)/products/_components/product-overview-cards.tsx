
import { Product, PaginationMeta } from '../_types'

interface ProductOverviewCardsProps {
  products: Product[]
  pagination: PaginationMeta
}

export default function ProductOverviewCards({
  products,
  pagination,
}: ProductOverviewCardsProps) {
  const totalProducts = pagination.total

  const totalInventoryValue = products.reduce((sum, product) => {
    const price = parseFloat(product.price || '0')
    const stock = product.stock || 0
    return sum + price * stock
  }, 0)

  const activeProducts = products.filter(
    (product) => product.status === 'ACTIVE'
  ).length

  const outOfStockOrArchived = products.filter(
    (product) => !product.in_stock || product.status === 'ARCHIVED'
  ).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-500">Total Products</h3>
        <p className="text-3xl font-bold">{totalProducts}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-500">Total Inventory Value</h3>
        <p className="text-3xl font-bold">${totalInventoryValue.toFixed(2)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-500">Active Products</h3>
        <p className="text-3xl font-bold">{activeProducts}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-500">Out of Stock / Archived</h3>
        <p className="text-3xl font-bold">{outOfStockOrArchived}</p>
      </div>
    </div>
  )
}
