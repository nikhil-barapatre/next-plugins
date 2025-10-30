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
  const { page = 1, pageSize = 10, search = '', categories, statuses } = params

  const where: Prisma.ProductWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categories && categories.length > 0) {
    where.category = { in: categories }
  }

  if (statuses && statuses.length > 0) {
    where.status = { in: statuses as Prisma.EnumProductStatusFilter }
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

export async function getDistinctCategories(): Promise<string[]> {
  const categories = await prisma.product.findMany({
    distinct: ['category'],
    select: { category: true },
    where: { category: { not: null, not: '' } },
  });
  return categories.map((c) => c.category as string);
}

export async function getDistinctStatuses(): Promise<Array<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>> {
  // Since status is an enum, we can hardcode or fetch distinct values if needed.
  // For now, let's return the known enum values.
  return ['DRAFT', 'ACTIVE', 'ARCHIVED'];
}
