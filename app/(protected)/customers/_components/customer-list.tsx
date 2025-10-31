'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { deleteCustomer } from '../_lib/api-client'
import { Customer } from '../_types'
import Link from 'next/link'
import { toast } from 'sonner'

interface CustomerListProps {
  data: Customer[]
  onDeleteSuccess: (customerId: string) => void
}

export default function CustomerList({ data, onDeleteSuccess }: CustomerListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState<string | null>(null)

  const openDeleteDialog = (customerId: string) => {
    setCustomerIdToDelete(customerId)
    setDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerIdToDelete) return

    try {
      await deleteCustomer(customerIdToDelete)
      toast.success('Customer deleted successfully')
      onDeleteSuccess(customerIdToDelete)
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toast.error('Failed to delete customer')
    } finally {
      setCustomerIdToDelete(null)
    }
  }

  return (
    <>
      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the customer."
        onConfirm={handleConfirmDelete}
      />
      <div className="rounded-lg border p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(customer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
