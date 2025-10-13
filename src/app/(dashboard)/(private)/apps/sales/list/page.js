// Component Imports

// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import { salesReports } from '@/fake-db/apps/customerReportData'
import SalesList from '@/views/apps/sales/list'

const SalesListPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <SalesList salesData={salesReports} />
}

export default SalesListPage
