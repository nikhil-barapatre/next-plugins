// app/(protected)/products/_validations/product.ts
import * as z from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  discountedPrice: z.string().optional(),
  stock: z.string().default('0'),
  category: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  inStock: z.boolean().default(true),
  chargeTax: z.boolean().default(false),
})
