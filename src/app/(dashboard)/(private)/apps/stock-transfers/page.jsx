import { stockTransfersData } from '@/fake-db/apps/stockTransfers'
import StockTransfers from '@/views/apps/ecommerce/stockTransfers'

const StockTransfersPage = () => {
  return <StockTransfers stockTransfersData={stockTransfersData} />
}

export default StockTransfersPage
