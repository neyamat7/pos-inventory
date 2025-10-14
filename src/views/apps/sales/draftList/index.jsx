'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SalesCard from './DraftCard'
import SalesListTable from './DraftListTable'

const DraftList = ({ draftProducts }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SalesCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SalesListTable draftProducts={draftProducts} />
      </Grid>
    </Grid>
  )
}

export default DraftList
