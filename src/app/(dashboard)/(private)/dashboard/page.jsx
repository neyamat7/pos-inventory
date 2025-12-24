export const dynamic = 'force-dynamic'

import { getAnalysisStats, getMonthlySummary } from '@/actions/dashboardActions'
import { getDailyCash } from '@/actions/cashActions'
import DashboardClient from './DashboardClient'

const DashboardCRM = async () => {
  const stats = await getAnalysisStats({ filter: 'daily' })
  const monthly = await getMonthlySummary()
  
  const today = new Date().toISOString().split('T')[0]
  const dailyCash = await getDailyCash(today)

  return (
    <DashboardClient 
      initialData={stats.data} 
      monthlySummary={monthly.data} 
      initialDailyCash={dailyCash.data?.dailyCash} 
    />
  )
}

export default DashboardCRM
