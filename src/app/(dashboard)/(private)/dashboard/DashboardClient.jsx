'use client'

import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid2'

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

import CardStatVertical from '@/components/card-statistics/Vertical'
import EarningReports from '@/views/dashboards/crm/EarningReports'
import EarningReportsWithTabs from '@/views/dashboards/crm/EarningReportsWithTabs'
import PopularProducts from '@/views/dashboards/crm/PopularProducts'
import { getAnalysisStats } from '@/actions/dashboardActions'

export default function DashboardClient({ initialData, monthlySummary }) {
  const [filter, setFilter] = useState('daily')
  const [statsData, setStatsData] = useState(initialData)

  const handleFilterChange = async value => {
    setFilter(value)

    const result = await getAnalysisStats({ filter: value })

    if (result.success) {
      setStatsData(result.data)
    }
  }

  return (
    <Grid container spacing={6}>
      {/* FILTER DROPDOWN */}
      <Grid size={{ xs: 12, md: 8, lg: 4 }}>
        <FormControl fullWidth size='small'>
          <InputLabel id='filter-label'>Filter</InputLabel>
          <Select
            labelId='filter-label'
            label='Filter'
            value={filter}
            onChange={e => handleFilterChange(e.target.value)}
          >
            <MenuItem value='daily'>Daily</MenuItem>
            <MenuItem value='weekly'>Weekly</MenuItem>
            <MenuItem value='monthly'>Monthly</MenuItem>
            <MenuItem value='yearly'>Yearly</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 0, md: 4, lg: 8 }}></Grid>

      {/* Total Sales */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Sales'
          subtitle='Today'
          stats={`৳${statsData.total_sales || 0}`}
          avatarColor='success'
          avatarIcon='tabler-chart-bar'
          avatarSkin='light'
          avatarSize={44}
          chipText='Sales'
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid>

      {/* Sales Due */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Sales Due'
          subtitle='Outstanding'
          stats={`৳${statsData.sales_due || 0}`}
          avatarColor='warning'
          avatarIcon='tabler-clock'
          avatarSkin='light'
          avatarSize={44}
          chipText='Due'
          chipColor='warning'
          chipVariant='tonal'
        />
      </Grid>

      {/* Total Income */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Income'
          subtitle='Today'
          stats={`৳${statsData.total_income || 0}`}
          avatarColor='info'
          avatarIcon='tabler-cash'
          avatarSkin='light'
          avatarSize={44}
          chipText='Income'
          chipColor='info'
          chipVariant='tonal'
        />
      </Grid>

      {/* Total Expense */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Expense'
          subtitle='Today'
          stats={`৳${statsData.total_expense || 0}`}
          avatarColor='error'
          avatarIcon='tabler-receipt'
          avatarSkin='light'
          avatarSize={44}
          chipText='Expense'
          chipColor='error'
          chipVariant='tonal'
        />
      </Grid>

      {/* Active Lots */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Active Lots'
          subtitle='Currently Active'
          stats={`${statsData.total_active_lots || 0}`}
          avatarColor='primary'
          avatarIcon='tabler-package'
          avatarSkin='light'
          avatarSize={44}
          chipText='Lots'
          chipColor='primary'
          chipVariant='tonal'
        />
      </Grid>

      {/* Total Customers */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Customers'
          subtitle='Registered'
          stats={`${statsData.total_customer || 0}`}
          avatarColor='secondary'
          avatarIcon='tabler-users'
          avatarSkin='light'
          avatarSize={44}
          chipText='Customers'
          chipColor='secondary'
          chipVariant='tonal'
        />
      </Grid>

      {/* Total Suppliers */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CardStatVertical
          title='Total Suppliers'
          subtitle='Registered'
          stats={`${statsData.total_supplier || 0}`}
          avatarColor='success'
          avatarIcon='tabler-truck'
          avatarSkin='light'
          avatarSize={44}
          chipText='Suppliers'
          chipColor='success'
          chipVariant='tonal'
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 12 }}>
        <EarningReportsWithTabs monthlySummary={monthlySummary} />
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
