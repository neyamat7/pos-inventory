import { getAllSuppliers, getEcommerceData } from '@/app/server/actions'
import AddPurchase from '@/views/apps/purchase/add/AddPurchase'

const add = async () => {
  const data = await getEcommerceData()
  const suppliers = await getAllSuppliers()

  return <AddPurchase productsData={data?.productsData} suppliersData={suppliers} />
}

export default add
