// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import AllStockList from '@/views/apps/ecommerce/allStock/list'

const AllStockPage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <AllStockList stockProductsData={data?.stockProductsData} />
}

export default AllStockPage
