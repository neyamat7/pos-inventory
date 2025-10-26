// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import CustomerDetails from '@/views/apps/ecommerce/customers/details'
import { getCustomerById } from '@/actions/customerActions'

const CustomerDetailsPage = async props => {
  const params = await props.params

  console.log('params in customer page', params.id)

  // Fetch customer data from backend
  const result = await getCustomerById(params.id)

  if (!result.success || !result.data) {
    console.error('Failed to fetch customer:', result.error)
    redirect('/not-found')
  }

  console.log('customer data', result.data)

  return result.data ? <CustomerDetails customerData={result.data} customerId={params.id} /> : null
}

export default CustomerDetailsPage
