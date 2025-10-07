'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

const SupplierRight = ({ children }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {/* Directly show Overview content */}
        {children}
      </Grid>
    </Grid>
  )
}

export default SupplierRight
