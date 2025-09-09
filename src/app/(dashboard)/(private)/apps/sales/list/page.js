// Component Imports
import OrderList from '@views/apps/ecommerce/orders/list'
import SalesList from '@/views/apps/pos/sales/list'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const SalesListPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <SalesList salesData={data?.salesData} />
}

export default SalesListPage
