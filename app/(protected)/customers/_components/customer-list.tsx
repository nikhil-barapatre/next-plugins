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
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { deleteCustomer } from '../_lib/api-client'
import { Customer, CustomerListProps } from '../_types'
import { toast } from 'sonner'
import CustomerFormDialog from './customer-form-dialog'

export default function CustomerList({ data, onDeleteSuccess }: CustomerListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined)

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

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    // You might want to refresh the data here
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
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
        onSuccess={handleFormSuccess}
      />
      <div className="rounded-lg border p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(customer)}>
                    Edit
                  </Button>
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
