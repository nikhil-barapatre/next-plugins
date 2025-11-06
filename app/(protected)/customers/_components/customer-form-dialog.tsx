
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import CustomerForm from './customer-form'
import { CustomerFormDialogProps } from '../_types'

export default function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
          <DialogDescription>
            {customer
              ? "Update the customer's details below."
              : 'Enter the details for the new customer.'}
          </DialogDescription>
        </DialogHeader>
        <CustomerForm customer={customer} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
