'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports

import PurchaseCard from './PurchaseCard'
import PurchaseListTable from './PurchaseListTable'

const SalesList = ({ purchaseData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PurchaseCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PurchaseListTable purchaseData={purchaseData} />
      </Grid>
    </Grid>
  )
}

export default SalesList
