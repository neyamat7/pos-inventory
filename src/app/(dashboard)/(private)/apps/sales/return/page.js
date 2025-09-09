// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import ReturnList from '@/views/apps/pos/sales/return'

const SalesReturnPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <ReturnList salesData={data?.salesData} />
}

export default SalesReturnPage
