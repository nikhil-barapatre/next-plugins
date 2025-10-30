import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { GetProductsParams, Product } from '../_types'

// Server-side API functions (for Route Handlers, Server Components, etc.)
export async function getProducts(params: GetProductsParams = {}): Promise<{
  products: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}> {
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

  const serializedProducts: Product[] = products.map((product) => {
    const productStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null =
      (product.status === 'DRAFT' || product.status === 'ACTIVE' || product.status === 'ARCHIVED')
        ? product.status
        : 'DRAFT';

    return {
      ...product,
      price: product.price.toString(),
      discounted_price: product.discounted_price?.toString() || null,
      status: productStatus,
    }
  })

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

export async function getProductById(productId: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    return null
  }

  const productStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null =
    (product.status === 'DRAFT' || product.status === 'ACTIVE' || product.status === 'ARCHIVED')
      ? product.status
      : 'DRAFT';

  return {
    ...product,
    price: product.price.toString(),
    discounted_price: product.discounted_price?.toString() || null,
    status: productStatus,
  }
}
