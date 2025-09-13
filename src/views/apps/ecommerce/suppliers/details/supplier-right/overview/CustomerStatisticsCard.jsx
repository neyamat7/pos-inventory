// MUI Imports
import Grid from '@mui/material/Grid2'
import { TbCurrencyTaka } from 'react-icons/tb'
import { GiCargoCrate } from 'react-icons/gi'

// Component Imports
import CustomerStats from '@components/card-statistics/CustomerStats'

const CustomerStatisticsCard = ({ supplierData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }} key={Math.random()}>
        <CustomerStats
          heading='Account Balance'
          value={`৳ ${supplierData.balance}`}
          subHeading='Remaining'
          description='Account balance for next purchase'
          Icon={TbCurrencyTaka}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} key={Math.random()}>
        <CustomerStats
          heading='Due Amount'
          value={`৳ ${supplierData.due}`}
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
          crate={supplierData.crate}
        />
      </Grid>
    </Grid>
  )
}

export default CustomerStatisticsCard
