// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import LowStockList from '@/views/apps/ecommerce/stockList/lowStock/list'

const LowStockPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <LowStockList lowStockData={data?.lowStockData} />
}

export default LowStockPage
