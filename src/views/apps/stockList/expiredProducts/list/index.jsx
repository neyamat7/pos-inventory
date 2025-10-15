'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ExpiredCard from './ExpiredCard'
import ExpiredListTable from './ExpiredListTable'

const ExpiredProductList = ({ expiredProducts }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ExpiredCard expiredProducts={expiredProducts} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ExpiredListTable expiredProducts={expiredProducts} />
      </Grid>
    </Grid>
  )
}

export default ExpiredProductList
