'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

import DueListCard from './DueListCard'
import DueListTable from './DueListTable'

const DueList = ({ suppliersData, customersData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <DueListCard suppliersData={suppliersData} customersData={customersData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DueListTable suppliersData={suppliersData} customersData={customersData} />
      </Grid>
    </Grid>
  )
}

export default DueList
