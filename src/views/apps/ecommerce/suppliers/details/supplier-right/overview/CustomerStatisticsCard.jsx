// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerStats from '@components/card-statistics/CustomerStats'

const CustomerStatisticsCard = ({ supplierData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }} key={Math.random()}>
        <CustomerStats {...supplierData} />
      </Grid>
    </Grid>
  )
}

export default CustomerStatisticsCard
