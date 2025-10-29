import { NextRequest, NextResponse } from 'next/server'

// app/api/products/route.ts

import type { ZodIssue } from 'zod'
// import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { productSchema } from '../../(protected)/products/_validations/product'
import { successResponse, ErrorResponses } from '../../(protected)/products/_lib/api-response'
import { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    // const session = await auth()
    // if (!session?.user) {
    //   return ErrorResponses.unauthorized()
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const productId = searchParams.get('id')

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        return ErrorResponses.notFound('Product not found')
      }

      const serializedProduct = {
        ...product,
        price: product.price.toString(),
        discounted_price: product.discounted_price?.toString() || null,
      }
      return successResponse(serializedProduct)
    }

    // Build filters...
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

    const serializedProducts = products.map((product: Prisma.Product) => ({
      ...product,
      price: product.price.toString(),
      discounted_price: product.discounted_price?.toString() || null,
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
    // const session = await auth()
    // if (!session?.user) {
    //   return ErrorResponses.unauthorized()
    // }

    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.issues)
    }

    const { discountedPrice, inStock, chargeTax, ...rest } = result.data

    const product = await prisma.product.create({
      data: {
        ...rest,
        price: new Decimal(result.data.price),
        discounted_price: discountedPrice
          ? new Decimal(discountedPrice)
          : null,
        stock: parseInt(result.data.stock || '0', 10),
        in_stock: inStock,
        charge_tax: chargeTax,
      },
    })

    const serialized = {
      ...product,
      price: product.price.toString(),
      discounted_price: product.discounted_price?.toString() || null,
    }

    return successResponse(serialized, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return ErrorResponses.internalError()
  }
}

// PUT /api/products
export async function PUT(request: NextRequest) {
  try {
    // const session = await auth()
    // if (!session?.user) {
    //   return ErrorResponses.unauthorized()
    // }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      const issue: ZodIssue = {
        code: 'custom',
        path: ['productId'],
        message: 'Product ID is required'
      };
      return ErrorResponses.validationError([issue]);
    }

    const body = await request.json()
    const result = productSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.issues)
    }

    const { discountedPrice, inStock, chargeTax, ...rest } = result.data

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...rest,
        price: new Decimal(result.data.price),
        discounted_price: discountedPrice
          ? new Decimal(discountedPrice)
          : null,
        stock: parseInt(result.data.stock || '0', 10),
        in_stock: inStock,
        charge_tax: chargeTax,
      },
    })

    const serialized = {
      ...updatedProduct,
      price: updatedProduct.price.toString(),
      discounted_price: updatedProduct.discounted_price?.toString() || null,
    }

    return successResponse(serialized)
  } catch (error) {
    console.error('Update product error:', error)
    return ErrorResponses.internalError()
  }
}

// DELETE /api/products
export async function DELETE(request: NextRequest) {
  try {
    // const session = await auth()
    // if (!session?.user) {
    //   return ErrorResponses.unauthorized()
    // }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      const issue: ZodIssue = {
        code: 'custom',
        path: ['productId'],
        message: 'Product ID is required'
      };
      return ErrorResponses.validationError([issue]);
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete product error:', error)
    return ErrorResponses.internalError()
  }
}
