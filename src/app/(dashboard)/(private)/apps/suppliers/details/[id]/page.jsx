// Next Imports
import { redirect } from 'next/navigation'

// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import SupplierDetaiils from '@/views/apps/ecommerce/suppliers/details'

const CustomerDetailsPage = async props => {
  const params = await props.params

  // console.log('typeof params', typeof params.id)

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/business/suppliers`, {
    cache: 'no-store'
  })

  const data = await res.json()

  const filteredData = data?.filter(item => item.sl === Number(params.id))[0]

  // console.log('filteredData', filteredData)

  if (!filteredData) {
    redirect('/not-found')
  }

  return filteredData ? <SupplierDetaiils supplierData={filteredData} supplierId={params.id} /> : null
}

export default CustomerDetailsPage
