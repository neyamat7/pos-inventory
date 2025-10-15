'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AllStockCard from './AllStockCard'
import AllStockListTable from './AllStockListTable'

const AllStockList = ({ stockProductsData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AllStockCard stockProductsData={stockProductsData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AllStockListTable stockProductsData={stockProductsData} />
      </Grid>
    </Grid>
  )
}

export default AllStockList
