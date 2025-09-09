// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import SalesList from '@/views/apps/sales/list'

const SalesListPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <SalesList salesData={data?.salesData} />
}

export default SalesListPage
