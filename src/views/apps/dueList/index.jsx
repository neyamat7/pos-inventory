'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

import DueListCard from './DueListCard'
import DueListTable from './DueListTable'

const DueList = ({
  // Current data
  tableData,
  paginationData,
  loading,

  // Type selection
  selectedType,
  onTypeChange,

  // Pagination & search handlers
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchTerm
}) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <DueListCard tableData={tableData} selectedType={selectedType} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DueListTable
          tableData={tableData}
          paginationData={paginationData}
          loading={loading}
          selectedType={selectedType}
          onTypeChange={onTypeChange}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearch={onSearch}
          searchTerm={searchTerm}
        />
      </Grid>
    </Grid>
  )
}

export default DueList
