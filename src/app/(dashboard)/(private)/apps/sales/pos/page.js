import { getEcommerceData } from '@/app/server/actions'
import Pos from '@/views/apps/sales/pos/Pos'

const posPage = async () => {
  const data = await getEcommerceData()

  return <Pos productsData={data?.productsData} />
}

export default posPage
