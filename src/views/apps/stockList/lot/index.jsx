'use client'

import Grid from '@mui/material/Grid2'

import AllLotCard from './AllLotCard'
import AllLotListTable from './AllLotListTable'

const LotStockList = ({ lotData }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AllLotCard lotData={lotData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <AllLotListTable lotData={lotData} />
      </Grid>
    </Grid>
  )
}

export default LotStockList
