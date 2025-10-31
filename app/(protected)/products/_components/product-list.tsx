// app/(protected)/products/_components/product-list.tsx
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
import { deleteProduct } from '../_lib/api-client'
import { Product } from '../_types'
import Link from 'next/link'
import { toast } from 'sonner'

interface ProductListProps {
  data: Product[]
  onDeleteSuccess: (productId: string) => void
}

export default function ProductList({ data, onDeleteSuccess }: ProductListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null)

  const openDeleteDialog = (productId: string) => {
    setProductIdToDelete(productId)
    setDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productIdToDelete) return

    try {
      await deleteProduct(productIdToDelete)
      toast.success('Product deleted successfully')
      onDeleteSuccess(productIdToDelete)
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    } finally {
      setProductIdToDelete(null)
    }
  }

  return (
    <>
      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the product."
        onConfirm={handleConfirmDelete}
      />
      <div className="rounded-lg border p-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(product.id)}
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
