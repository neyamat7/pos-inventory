// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import SalesReport from '@/views/apps/reports/salesReport'

const SalesReportPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <SalesReport SalesReportData={data?.salesReportData} />
}

export default SalesReportPage
