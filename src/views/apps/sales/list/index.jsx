'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SalesCard from './SalesCard'
import SalesListTable from './SalesListTable'

const SalesList = ({ salesData, paginationData, loading, onPageChange, onPageSizeChange, onSearch, searchTerm }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SalesCard salesData={salesData} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SalesListTable
          salesData={salesData}
          paginationData={paginationData}
          loading={loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearch={onSearch}
          searchTerm={searchTerm}
        />
      </Grid>
    </Grid>
  )
}

export default SalesList
