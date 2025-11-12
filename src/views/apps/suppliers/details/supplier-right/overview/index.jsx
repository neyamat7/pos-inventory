// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PurchaseReport from './PurchaseReport'
import { getLotsBySupplier, getPurchaseBySupplier, getSupplierPayments } from '@/actions/supplierAction'
import { getBalanceHistory } from '@/actions/balanceActions'

const Overview = async ({ supplierId, supplierData }) => {
  const lotsResult = await getLotsBySupplier(supplierId, 1, 10, '', '', '')

  const purchaseResult = await getPurchaseBySupplier(supplierId, 1, 10, '', '', '')

  const balanceResult = await getBalanceHistory(supplierId, 1, 10, '', '')

  const paymentResult = await getSupplierPayments({ supplierId, page: 1, limit: 10 })

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PurchaseReport
          supplierId={supplierId}
          initialLotsData={lotsResult}
          initialPurchaseData={purchaseResult}
          initialBalanceData={balanceResult}
          initialPaymentData={paymentResult}
          supplierData={supplierData}
        />
      </Grid>
    </Grid>
  )
}

export default Overview
