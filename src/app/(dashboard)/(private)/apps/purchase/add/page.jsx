import { getEcommerceData } from '@/app/server/actions'
import AddPurchase from '@/views/apps/purchase/add/AddPurchase'

const add = async () => {
  const data = await getEcommerceData()

  return <AddPurchase productsData={data?.productsData} />
}

export default add
