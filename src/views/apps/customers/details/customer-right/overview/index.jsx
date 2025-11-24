// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SalesReport from './SalesReport'
import { getCustomerCrateHistory, getSalesByCustomer } from '@/actions/customerActions'
import { getBalanceHistory } from '@/actions/balanceActions'

const Overview = async ({ customerId }) => {
  // Fetch customer sales data from backend
  const salesResult = await getSalesByCustomer(customerId, 1, 10, '', '', '')

  const balanceResult = await getBalanceHistory(customerId, 1, 10, '', '')

  const crateHistoryResult = await getCustomerCrateHistory(customerId, 1, 10)

  // console.log('sales result', salesResult)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SalesReport
          customerId={customerId}
          initialSalesData={salesResult}
          initialBalanceData={balanceResult}
          initialCrateHistoryData={crateHistoryResult}
        />
      </Grid>
    </Grid>
  )
}

export default Overview
