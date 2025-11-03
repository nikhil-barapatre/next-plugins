import { prisma } from '@/lib/db';
import type { Prisma, CustomerStatus } from '@prisma/client';
import type { GetCustomersParams } from '../_types'

// Server-side API functions (for Route Handlers, Server Components, etc.)
export async function getCustomers(params: GetCustomersParams = {}) {
  const { page = 1, pageSize = 10, search = '', status } = params

  const where: Prisma.CustomerWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status) {
    where.status = status as CustomerStatus;
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

export async function getCustomerStats() {
    const totalCustomers = await prisma.customer.count();
  
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
    const newCustomersThisMonth = await prisma.customer.count({
      where: {
        created_at: {
          gte: startOfMonth,
        },
      },
    });
  
    const activeCustomers = await prisma.customer.count({
      where: {
        status: 'ACTIVE',
      },
    });
  
    const inactiveCustomers = await prisma.customer.count({
      where: {
        status: 'INACTIVE',
      },
    });
  
    return {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      inactiveCustomers,
    };
  }
