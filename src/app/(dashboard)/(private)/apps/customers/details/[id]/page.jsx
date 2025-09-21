// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import CustomerDetails from '@/views/apps/ecommerce/customers/details'
import { customers } from '@/data/customerData/customerData'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const CustomerDetailsPage = async props => {
  const params = await props.params

  console.log('params in customer page', params.id)

  // Vars
  // const data = await getEcommerceData()
  const filteredData = customers.filter(item => item.sl === Number(params.id))[0]

  console.log('filteredData', filteredData)

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <CustomerDetails customerData={filteredData} customerId={params.id} /> : null
}

export default CustomerDetailsPage
