// Component Imports
import PurchaseList from '@/views/apps/purchase/list'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const purchaseListPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <PurchaseList purchaseData={data?.purchaseData} />
}

export default purchaseListPage
