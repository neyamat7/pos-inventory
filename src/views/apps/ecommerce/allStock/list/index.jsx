'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports

import PurchaseCard from './PurchaseCard'
import PurchaseListTable from './PurchaseListTable'

const AllStockList = ({ stockProductsData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PurchaseCard stockProductsData={stockProductsData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PurchaseListTable stockProductsData={stockProductsData} />
      </Grid>
    </Grid>
  )
}

export default AllStockList
