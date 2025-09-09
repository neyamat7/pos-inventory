// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import ExpiredProductList from '@/views/apps/ecommerce/stockList/expiredProducts/list'

const ExpiredProductsPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <ExpiredProductList expiredProducts={data?.expiredProducts} />
}

export default ExpiredProductsPage
