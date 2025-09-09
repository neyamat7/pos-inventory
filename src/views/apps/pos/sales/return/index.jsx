'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports

import SalesCard from './SalesCard'
import SalesListTable from './SalesListTable'

const ReturnList = ({ salesData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SalesCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SalesListTable salesData={salesData} />
      </Grid>
    </Grid>
  )
}

export default ReturnList
