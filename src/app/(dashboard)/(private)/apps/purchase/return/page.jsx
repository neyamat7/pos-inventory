// Data Imports
import { getEcommerceData } from '@/app/server/actions' 
import PurchaseReturnList from '@/views/apps/purchase/return'

const PurchaseReturnPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <PurchaseReturnList purchaseReturnData={data?.purchaseReturnData} />
}

export default PurchaseReturnPage
