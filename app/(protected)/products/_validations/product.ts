import * as z from 'zod'

export const productSchema = z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.string().min(1, 'Price is required'),
    discountedPrice: z.string().optional().nullable(),
    stock: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT').nullable().optional(),
    inStock: z.boolean(),
    chargeTax: z.boolean(),
})

export type ProductFormData = z.infer<typeof productSchema>
