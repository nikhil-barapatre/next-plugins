import { getCustomers } from '@/lib/server/customers'
import CustomersClientPage from './_components/customers-client-page'
import { Suspense } from 'react'
import { CustomersPageProps } from './_types'

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams; // ✅ Must unwrap

  const page = Number(params.page) || 1;
  const search = params.search || '';
  const status = params.status || '';

  const { customers, pagination } = await getCustomers({ page, search, status });
  const distinctStatuses = ['ACTIVE', 'INACTIVE'];

  return (
    <div className="p-4">
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
