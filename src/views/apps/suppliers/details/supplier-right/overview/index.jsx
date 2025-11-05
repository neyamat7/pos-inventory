// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PurchaseReport from './PurchaseReport'
import { getLotsBySupplier, getPurchaseBySupplier } from '@/actions/supplierAction'
import { getBalanceHistory } from '@/actions/balanceActions'

const Overview = async ({ supplierId }) => {
  // Fetch supplier lots data from backend
  const lotsResult = await getLotsBySupplier(supplierId, 1, 10, '', '', '')

  // Fetch supplier purchase data from backend
  const purchaseResult = await getPurchaseBySupplier(supplierId, 1, 10, '', '', '')

  const balanceResult = await getBalanceHistory(supplierId, 1, 10, '', '')

  // console.log('baldfh', balanceResult)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PurchaseReport
          supplierId={supplierId}
          initialLotsData={lotsResult}
          initialPurchaseData={purchaseResult}
          initialBalanceData={balanceResult}
        />
      </Grid>
    </Grid>
  )
}

export default Overview
