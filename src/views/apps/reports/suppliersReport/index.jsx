'use client'

import Grid from '@mui/material/Grid2'

// Component Imports
import SuppliersReportCard from './SuppliersReportCard'
import SuppliersListTable from './SuppliersListTable'

const SuppliersReport = ({ supplierReportData }) => {
  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <SuppliersReportCard supplierReportData={supplierReportData} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SuppliersListTable supplierReportData={supplierReportData} />
        </Grid>
      </Grid>
    </>
  )
}

export default SuppliersReport
