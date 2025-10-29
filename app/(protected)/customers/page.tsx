import { getCustomers } from './_lib/server-api'
import CustomerList from './_components/customer-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CustomersPage() {
  const { customers, pagination } = await getCustomers()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Link href="/customers/create">
          <Button>Create Customer</Button>
        </Link>
      </div>
      <CustomerList data={customers} pagination={pagination} />
    </div>
  )
}
