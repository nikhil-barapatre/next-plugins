// app/(protected)/products/_lib/server-api.ts
import { prisma } from '@/lib/db'
import type { GetProductsParams, Product } from '../_types'

export async function getProducts(params: GetProductsParams = {}) {
  const { page = 1, pageSize = 10, search = '', categories = [], statuses = [] } = params

  const skip = (page - 1) * pageSize
  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categories.length > 0) {
    where.category = { in: categories }
  }

  if (statuses.length > 0) {
    where.status = { in: statuses }
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ])

  // Convert Decimal to string for client components
  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
    discountedPrice: product.discountedPrice?.toString() || null,
  }))

  return {
    products: serializedProducts,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}
