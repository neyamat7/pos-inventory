// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerStatisticsCard from './CustomerStatisticsCard'
import OrderListTable from './OrderListTable'

// Data Imports
import { getStatisticsData, getEcommerceData, getSupplierById } from '@/app/server/actions'

const Overview = async ({ supplierId }) => {
  // Vars
  // const data = await getStatisticsData()
  const supplierData = await getSupplierById(supplierId)
  const tableData = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerStatisticsCard supplierData={supplierData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OrderListTable orderData={tableData?.orderData} />
      </Grid>
    </Grid>
  )
}

export default Overview
