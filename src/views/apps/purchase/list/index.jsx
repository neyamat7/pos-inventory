'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PurchaseCard from './PurchaseCard'
import PurchaseListTable from './PurchaseListTable'

const PurchaseList = ({ purchaseData, paginationData, loading, onPageChange, onPageSizeChange }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PurchaseCard purchaseData={purchaseData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PurchaseListTable
          purchaseData={purchaseData}
          paginationData={paginationData}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Grid>
    </Grid>
  )
}

export default PurchaseList
