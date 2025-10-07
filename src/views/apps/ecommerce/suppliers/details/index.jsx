// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SupplierLeftOverview from './supplier-left-overview'
import SupplierRight from './supplier-right'
import SupplierDetailHeader from './SupplierDetailsHeader'

// Dynamic import for Overview tab
const OverViewTab = dynamic(() => import('@views/apps/ecommerce/suppliers/details/supplier-right/overview'))

const SupplierDetails = ({ supplierData, supplierId }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SupplierDetailHeader supplierId={supplierId} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SupplierLeftOverview supplierData={supplierData} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {/* Directly render overview content instead of using tabs */}
        <SupplierRight>
          <OverViewTab supplierId={supplierId} />
        </SupplierRight>
      </Grid>
    </Grid>
  )
}

export default SupplierDetails
