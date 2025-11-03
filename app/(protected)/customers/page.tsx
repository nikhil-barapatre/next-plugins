import { getCustomers } from './_lib/server-api'
import CustomersClientPage from './_components/customers-client-page'
import { Suspense } from 'react'
import CustomerOverviewCards from './_components/customer-overview-cards'

interface CustomersPageProps {
  searchParams: {
    page?: string
    search?: string
    status?: string
  }
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || '';
  const status = searchParams.status || '';

  const { customers, pagination } = await getCustomers({ page, search, status })
  const distinctStatuses = ['ACTIVE', 'INACTIVE'];

  return (
    <div className="p-4">
        <Suspense fallback={<div>Loading stats...</div>}>
            <CustomerOverviewCards />
        </Suspense>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomersClientPage 
          initialCustomers={customers} 
          initialPagination={pagination} 
          distinctStatuses={distinctStatuses}
        />
      </Suspense>
    </div>
  )
}
