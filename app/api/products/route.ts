// app/api/products/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { productSchema } from '@/products/_validations/product'
import { successResponse, ErrorResponses } from '@/products/_lib/api-response'

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ErrorResponses.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''

    // Build filters...
    const where: any = {}
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    const serializedProducts = products.map((product) => ({
      ...product,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || null,
    }))

    return successResponse(serializedProducts, {
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return ErrorResponses.internalError()
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return ErrorResponses.unauthorized()
    }

    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.errors)
    }

    const product = await prisma.product.create({
      data: {
        ...result.data,
        price: new Decimal(result.data.price),
        discountedPrice: result.data.discountedPrice
          ? new Decimal(result.data.discountedPrice)
          : null,
        stock: parseInt(result.data.stock, 10),
      },
    })

    const serialized = {
      ...product,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || null,
    }

    return successResponse(serialized, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return ErrorResponses.internalError()
  }
}
