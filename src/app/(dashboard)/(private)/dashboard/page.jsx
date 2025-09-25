// MUI Imports
import { redirect } from 'next/navigation'

import Grid from '@mui/material/Grid2'

// Component Imports
import LineAreaYearlySalesChart from '@views/dashboards/crm/LineAreaYearlySalesChart'
import CardStatVertical from '@/components/card-statistics/Vertical'
import BarChartRevenueGrowth from '@views/dashboards/crm/BarChartRevenueGrowth'
import EarningReportsWithTabs from '@views/dashboards/crm/EarningReportsWithTabs'
import RadarSalesChart from '@views/dashboards/crm/RadarSalesChart'
import SalesByCountries from '@views/dashboards/crm/SalesByCountries'
import ProjectStatus from '@views/dashboards/crm/ProjectStatus'
import ActiveProjects from '@views/dashboards/crm/ActiveProjects'
import LastTransaction from '@views/dashboards/crm/LastTransaction'
import ActivityTimeline from '@views/dashboards/crm/ActivityTimeline'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { auth } from '@/auth'
import EarningReports from '@/views/dashboards/crm/EarningReports'
import PopularProducts from '@/views/dashboards/crm/PopularProducts'
import DistributedBarChartPurchase from '@/views/dashboards/crm/DistributedBarChartPurchase'
import DistributedBarChartPurchaseDue from '@/views/dashboards/crm/DistributedBarChartPurchaseDue'
import LineAreaYearlySalesChartDue from '@/views/dashboards/crm/LineAreaYearlySalesChartDue'
import DistributedBarChartPurchaseReturn from '@/views/dashboards/crm/DistributedBarChartPurchaseReturn'
import LineAreaYearlySalesChartReturn from '@/views/dashboards/crm/LineAreaYearlySalesChartReturn'

const DashboardCRM = async () => {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Vars
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <DistributedBarChartPurchase />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <DistributedBarChartPurchaseDue />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <DistributedBarChartPurchaseReturn />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <LineAreaYearlySalesChart />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <LineAreaYearlySalesChartDue />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <LineAreaYearlySalesChartReturn />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Profit'
          subtitle='Last Week'
          stats='1.28k'
          avatarColor='error'
          avatarIcon='tabler-credit-card'
          avatarSkin='light'
          avatarSize={44}
          chipText='-12.2%'
          chipColor='error'
          chipVariant='tonal'
        />
      </Grid>

      {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Sales'
          subtitle='Last Week'
          stats='24.67k'
          avatarColor='success'
          avatarIcon='tabler-currency-dollar'
          avatarSkin='light'
          avatarSize={44}
          chipText='+24.67%'
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid> */}

      <Grid size={{ xs: 12, md: 8, lg: 3 }}>
        <BarChartRevenueGrowth />
      </Grid>
      <Grid size={{ xs: 12, lg: 12 }}>
        <EarningReportsWithTabs />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <EarningReports />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 6 }}>
        <PopularProducts />
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
