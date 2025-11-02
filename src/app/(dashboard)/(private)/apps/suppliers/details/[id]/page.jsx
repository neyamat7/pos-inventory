// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import SupplierDetails from '@/views/apps/suppliers/details'
import { getSupplierById } from '@/actions/supplierAction'

const SupplierDetailsPage = async props => {
  const params = await props.params

  // Fetch supplier data from backend
  const result = await getSupplierById(params.id)

  if (!result.success || !result.data) {
    console.error('Failed to fetch supplier:', result.error)
    redirect('/not-found')
  }

  return result.data ? <SupplierDetails supplierData={result.data} supplierId={params.id} /> : null
}

export default SupplierDetailsPage
