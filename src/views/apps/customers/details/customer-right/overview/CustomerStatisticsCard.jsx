// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { TbCurrencyTaka } from 'react-icons/tb'
import { GiCargoCrate } from 'react-icons/gi'

import CustomerStats from '@components/card-statistics/CustomerStats'

const CustomerStatisticsCard = ({ customerStatData }) => {
  console.log('customerStatData', customerStatData)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }} key={Math.random()}>
        <CustomerStats
          heading='Account Balance'
          value={`৳ ${customerStatData.balance}`}
          subHeading='Remaining'
          description='Account balance for next purchase'
          Icon={TbCurrencyTaka}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} key={Math.random()}>
        <CustomerStats
          heading='Due Amount'
          value={`৳ ${customerStatData.due}`}
          subHeading='Remaining due'
          description='Amount remaining to be paid'
          Icon={TbCurrencyTaka}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} key={Math.random()}>
        <CustomerStats
          heading='Total Crate'
          subHeading='Remaining'
          description=''
          Icon={GiCargoCrate}
          crate={customerStatData.crate}
        />
      </Grid>
    </Grid>
  )
}

export default CustomerStatisticsCard
