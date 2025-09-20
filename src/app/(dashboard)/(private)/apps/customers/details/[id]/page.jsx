// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import CustomerDetails from '@/views/apps/ecommerce/customers/details'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const CustomerDetailsPage = async props => {
  const params = await props.params

  console.log('params in customer page', params.id)

  // Vars
  const data = await getEcommerceData()
  const filteredData = data?.customerData.filter(item => item.customerId === params.id)[0]

  console.log('filteredData', filteredData)

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <CustomerDetails customerData={filteredData} customerId={params.id} /> : null
}

export default CustomerDetailsPage
