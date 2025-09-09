// Component Imports
import SalesList from '@/views/apps/purchase/list'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const SalesListPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <SalesList salesData={data?.salesData} />
}

export default SalesListPage
