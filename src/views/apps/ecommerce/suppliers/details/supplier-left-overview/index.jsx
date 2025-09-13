// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerPlan from './CustomerPlan'
import SupplierDetails from './SuppllierDetails'

const CustomerLeftOverview = ({ supplierData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SupplierDetails supplierData={supplierData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomerPlan />
      </Grid>
    </Grid>
  )
}

export default CustomerLeftOverview
