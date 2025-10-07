'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

const CustomerRight = ({ children }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        {/* Directly show overview tab content */}
        {children}
      </Grid>
    </Grid>
  )
}

export default CustomerRight
