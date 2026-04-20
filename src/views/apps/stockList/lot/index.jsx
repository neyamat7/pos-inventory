'use client'

import Grid from '@mui/material/Grid2'

import AllLotCard from './AllLotCard'
import AllLotListTable from './AllLotListTable'

const LotStockList = ({ lotData, paginationData, loading, cashSummary, onPageChange, onPageSizeChange, onSearchChange }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AllLotCard lotData={lotData} loading={loading} cashSummary={cashSummary} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AllLotListTable
          lotData={lotData}
          paginationData={paginationData}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearchChange={onSearchChange}
        />
      </Grid>
    </Grid>
  )
}

export default LotStockList
