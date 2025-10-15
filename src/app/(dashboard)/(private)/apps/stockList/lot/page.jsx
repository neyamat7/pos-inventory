import { lots } from '@/fake-db/apps/lotsData'
import LotStockList from '@/views/apps/stockList/lot'

const LotPage = async () => {
  return <LotStockList lotData={lots} />
}

export default LotPage
