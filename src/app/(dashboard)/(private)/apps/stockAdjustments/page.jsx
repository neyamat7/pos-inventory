import { stockAdjustments } from '@/fake-db/apps/stockAdjustments'
import StockAdjustments from '@/views/apps/stockAdjustments'

const StockAdjustmentsPage = () => {
  return <StockAdjustments stockAdjustments={stockAdjustments} />
}

export default StockAdjustmentsPage
