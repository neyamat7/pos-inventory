import { getAnalysisStats, getMonthlySummary } from '@/actions/dashboardActions'
import DashboardClient from './DashboardClient'

const DashboardCRM = async () => {
  const stats = await getAnalysisStats({ filter: 'daily' })
  const monthly = await getMonthlySummary()

  console.log('monthly', monthly)

  return <DashboardClient initialData={stats.data} monthlySummary={monthly.data} />
}

export default DashboardCRM
