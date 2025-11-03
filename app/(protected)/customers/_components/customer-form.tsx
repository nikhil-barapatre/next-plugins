'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { customerSchema, CustomerFormData } from '../_validations/customer'
import { createCustomer, updateCustomer, Customer, ValidationError } from '../_lib/api-client'

interface CustomerFormProps {
  customer?: Customer
  onSuccess: () => void
}

export default function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (customer) {
        await updateCustomer(customer.id, data)
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(data)
        toast.success('Customer created successfully')
      }
      onSuccess()
      router.refresh() // To see the updated list
    } catch (error) {
      if (error instanceof ValidationError) {
        error.issues.forEach((issue) => {
          form.setError(issue.path[0] as keyof CustomerFormData, {
            type: 'server',
            message: issue.message,
          })
        })
      } else {
        toast.error('An unexpected error occurred')
        console.error(error)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 123-456-7890" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. 123 Main St, Anytown, USA"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : (customer ? 'Update' : 'Create') + ' Customer'}
        </Button>
      </form>
    </Form>
  )
}
