import CustomerForm from '../../_components/customer-form'
import { getCustomerById } from '../../_lib/server-api'

export default async function EditCustomerPage({
  params: awaitedParams,
}: {
  params: Promise<{ id: string }>
}) {
  const params = await awaitedParams;
  const customer = await getCustomerById(params.id)

  if (!customer) {
    return <div>Customer not found</div>
  }

  return (
    <div className="container mx-auto py-10">   
      <h1 className="text-2xl font-bold mb-5">Edit Customer</h1>
      <CustomerForm customer={customer} />
    </div>
  )
}
