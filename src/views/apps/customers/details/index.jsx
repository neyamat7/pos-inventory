// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerDetailsHeader from './CustomerDetailsHeader'
import CustomerLeftOverview from './customer-left-overview'
import CustomerRight from './customer-right'

// Dynamically import OverviewTab
const OverViewTab = dynamic(() => import('@views/apps/customers/details/customer-right/overview'))

const CustomerDetails = ({ customerData, customerId }) => {
  // console.log('cus id', customerId)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerDetailsHeader customerId={customerId} customerData={customerData} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <CustomerLeftOverview customerData={customerData} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        {/* Directly render overview content */}
        <CustomerRight>
          <OverViewTab customerId={customerId} />
        </CustomerRight>
      </Grid>
    </Grid>
  )
}

export default CustomerDetails
