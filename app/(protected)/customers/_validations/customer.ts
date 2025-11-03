import * as z from 'zod'

export const customerSchema = z.object({
    name: z.string().min(2, 'Customer name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    status: z.boolean().optional(),
})

export const customerApiSchema = customerSchema.extend({
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  });

export type CustomerFormData = z.infer<typeof customerSchema>
export type CustomerApiData = z.infer<typeof customerApiSchema>
