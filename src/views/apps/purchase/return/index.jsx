'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ReturnPurchaseTable from './ReturnPurchaseTable'
import ReturnPurchaseCard from './ReturnPurchaseCard'

const PurchaseReturnList = ({ purchaseReturnData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ReturnPurchaseCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReturnPurchaseTable purchaseReturnData={purchaseReturnData} />
      </Grid>
    </Grid>
  )
}

export default PurchaseReturnList
