'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ReturnSalesTable from './ReturnSalesTable'
import ReturnSalesCard from './ReturnSalesCard'

const ReturnList = ({ salesReturnData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ReturnSalesCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReturnSalesTable salesReturnData={salesReturnData} />
      </Grid>
    </Grid>
  )
}

export default ReturnList
