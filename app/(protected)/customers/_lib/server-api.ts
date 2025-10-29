import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { GetCustomersParams } from '../_types'

// Server-side API functions (for Route Handlers, Server Components, etc.)
export async function getCustomers(params: GetCustomersParams = {}) {
  const { page = 1, pageSize = 10, search = '' } = params

  const where: Prisma.CustomerWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    customers: customers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getCustomerById(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })

  if (!customer) {
    return null
  }

  return customer
}
