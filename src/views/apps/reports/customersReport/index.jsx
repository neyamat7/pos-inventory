'use client'

import Grid from '@mui/material/Grid2'

// Component Imports
import CustomersReportCard from './CustomersReportCard'
import CustomersListTable from './CustomersListTable'

const CustomersReport = ({ customerReportData }) => {
  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomersReportCard customerReportData={customerReportData} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomersListTable customerReportData={customerReportData} />
        </Grid>
      </Grid>
    </>
  )
}

export default CustomersReport
