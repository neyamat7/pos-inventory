// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SupplierLeftOverview from './supplier-left-overview'
import SupplierRight from './supplier-right'
import SupplierDetailHeader from './SupplierDetailsHeader'

const OverViewTab = dynamic(() => import('@views/apps/ecommerce/suppliers/details/supplier-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/ecommerce/customers/details/customer-right/security'))
const NotificationsTab = dynamic(() => import('@views/apps/ecommerce/customers/details/customer-right/notification'))

const AddressBillingTab = dynamic(
  () => import('@views/apps/ecommerce/customers/details/customer-right/address-billing')
)

// Vars
const tabContentList = (supplierId) => ({
  overview: <OverViewTab supplierId={supplierId} />,
  security: <SecurityTab />,
  addressBilling: <AddressBillingTab />,
  notifications: <NotificationsTab />
})

const SupplierDetaiils = ({ supplierData, supplierId }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SupplierDetailHeader supplierId={supplierId} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SupplierLeftOverview supplierData={supplierData} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <SupplierRight tabContentList={tabContentList(supplierId)} />
      </Grid>
    </Grid>
  )
}

export default SupplierDetaiils
