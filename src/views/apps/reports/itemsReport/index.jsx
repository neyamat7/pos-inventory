'use client'

// MUI Imports
import { useState, useMemo } from 'react'

import Grid from '@mui/material/Grid2'

// Component Imports
import ItemReportCard from './ItemReportCard'
import ItemReportListTable from './ItemReportListTable'

const ItemsReport = ({ itemsReportData }) => {
  const [filterDate, setFilterDate] = useState('')

  // Function to filter data by selected date
  const handleFilterByDate = date => {
    setFilterDate(date)
  }

  // Filter & sort data
  const filteredData = useMemo(() => {
    let data = [...itemsReportData]

    // Filter by date if selected
    if (filterDate) {
      data = data.filter(item => item.date === filterDate)
    }

    // Sort by date (recent first)
    return data.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [itemsReportData, filterDate])

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ItemReportCard />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ItemReportListTable itemsReportData={filteredData} onFilterByDate={handleFilterByDate} />
        </Grid>
      </Grid>
    </>
  )
}

export default ItemsReport
