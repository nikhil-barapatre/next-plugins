import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { GetProductsParams } from '../_types'

// Server-side API functions (for Route Handlers, Server Components, etc.)
export async function getProducts(params: GetProductsParams = {}) {
  const { page = 1, pageSize = 10, search = '' } = params

  const where: Prisma.ProductWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
    discounted_price: product.discounted_price?.toString() || null,
  }))

  return {
    products: serializedProducts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    return null
  }

  return {
    ...product,
    price: product.price.toString(),
    discounted_price: product.discounted_price?.toString() || null,
  }
}
