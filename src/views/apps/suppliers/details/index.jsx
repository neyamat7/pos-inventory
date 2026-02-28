// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SupplierLeftOverview from './supplier-left-overview'
import SupplierRight from './supplier-right'
import SupplierDetailHeader from './SupplierDetailsHeader'

// Dynamic import for Overview tab
const OverViewTab = dynamic(() => import('@views/apps/suppliers/details/supplier-right/overview'))

const SupplierDetails = ({ supplierData, supplierId }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SupplierDetailHeader supplierId={supplierId} supplierData={supplierData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SupplierLeftOverview supplierData={supplierData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SupplierRight>
          <OverViewTab supplierId={supplierId} supplierData={supplierData} />
        </SupplierRight>
      </Grid>
    </Grid>
  )
}

export default SupplierDetails