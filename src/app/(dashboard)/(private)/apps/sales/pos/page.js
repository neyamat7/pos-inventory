import { getEcommerceData } from '@/app/server/actions'
import POSSystem from '@/views/apps/sales/pos/Pos'
 

const posPage = async () => {
  const data = await getEcommerceData()

  // return <Pos productsData={data?.productsData} />
  return <POSSystem productsData={data?.productsData} />
}

export default posPage
