// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import PurchaseReport from '@/views/apps/reports/purchaseReport'

const PurchaseReportPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <PurchaseReport PurchaseReportData={data?.purchaseReportData} />
}

export default PurchaseReportPage
