import { getCustomers } from './_lib/server-api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CustomersClientPage from './_components/customers-client-page'
import { Suspense } from 'react'

interface CustomersPageProps {
  searchParams: {
    page?: string
    search?: string
  }
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';

  const { customers, pagination } = await getCustomers({ page, search })

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/create">
          <Button>Create Customer</Button>
        </Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomersClientPage 
          initialCustomers={customers} 
          initialPagination={pagination} 
        />
      </Suspense>
    </div>
  )
}
