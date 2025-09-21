// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerStatisticsCard from './CustomerStatisticsCard'
import OrderListTable from './OrderListTable'
import { customers } from '@/data/customerData/customerData'

// Data Imports
import { getStatisticsData, getEcommerceData } from '@/app/server/actions'

const Overview = async ({ customerId }) => {
  console.log('customerId', customerId)

  // Vars
  // const data = await getStatisticsData()
  const tableData = await getEcommerceData()

  const customer = customers.find(item => item.sl === Number(customerId))

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerStatisticsCard customerStatData={customer} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OrderListTable orderData={tableData?.orderData} />
      </Grid>
    </Grid>
  )
}

export default Overview
