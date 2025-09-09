'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import LowStockCard from './LowStockCard'
import LowStockListTable from './LowStockListTable'

const LowStockList = ({ lowStockData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <LowStockCard lowStockData={lowStockData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <LowStockListTable lowStockData={lowStockData} />
      </Grid>
    </Grid>
  )
}

export default LowStockList
