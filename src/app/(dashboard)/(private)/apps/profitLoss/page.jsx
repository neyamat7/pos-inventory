export const dynamic = 'force-dynamic'

import { getProfitLoss } from '@/actions/incomeActions'
import ProfitLoss from '@/views/apps/profitLoss/ind'

const ProfitLossPage = async () => {
  const result = await getProfitLoss()

  const profitLossData = result.success
    ? result.data
    : {
        totalCustomerProfit: 0,
        totalLotProfit: 0,
        totalCombinedProfit: 0,
        totalLoss: 0,
        recordCount: 0
      }

  return <ProfitLoss profitLossData={profitLossData} />
}

export default ProfitLossPage
