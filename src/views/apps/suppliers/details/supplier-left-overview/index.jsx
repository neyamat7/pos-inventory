// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SupplierDetails from './SuppllierDetails'

const CustomerLeftOverview = ({ supplierData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SupplierDetails supplierData={supplierData} />
      </Grid>
    </Grid>
  )
}

export default CustomerLeftOverview
