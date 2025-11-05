import { getProductById } from '../../_lib/server-api'
import ProductForm from '../../_components/product-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const product = await getProductById(id)

  if (!product) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link href="/products">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
