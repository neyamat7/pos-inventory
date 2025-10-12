// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PurchaseReport from './PurchaseReport'

// Data Imports
import { getEcommerceData, getSupplierById } from '@/app/server/actions'

const Overview = async ({ supplierId }) => {
  const tableData = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PurchaseReport orderData={tableData?.orderData} />
      </Grid>
    </Grid>
  )
}

export default Overview
