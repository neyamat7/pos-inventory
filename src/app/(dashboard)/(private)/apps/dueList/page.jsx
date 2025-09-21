import { getAllSuppliers } from '@/app/server/actions'
import DueList from '@/views/apps/ecommerce/dueList'

// Data Imports
import { customers } from '@/data/customerData/customerData'

const DueListPage = async () => {
  const suppliers = await getAllSuppliers()

  return <DueList suppliersData={suppliers} customersData={customers} />
}

export default DueListPage
