// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import { customerReturns } from '@/fake-db/apps/customerReportData'
import ReturnList from '@/views/apps/sales/return'

const SalesReturnPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <ReturnList salesReturnData={customerReturns} />
}

export default SalesReturnPage
