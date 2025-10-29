// app/(protected)/products/create/page.tsx
import ProductForm from '../_components/product-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function CreateProductPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Create Product</h1>
        <Link href="/products">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
      <ProductForm />
    </div>
  )
}
