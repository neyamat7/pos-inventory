// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import CustomerDetails from '@/views/apps/ecommerce/customers/details'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const CustomerDetailsPage = async props => {
  const params = await props.params

  console.log('typeof params', typeof params.id)

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/business/suppliers`, {
    cache: 'no-store'
  })

  const data = await res.json()

  const filteredData = data?.filter(item => item.sl === Number(params.id))[0]

  console.log('filteredData', filteredData)

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <CustomerDetails customerData={filteredData} customerId={params.id} /> : null
}

export default CustomerDetailsPage
