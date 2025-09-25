'use client'

// MUI Imports
import { useState, useMemo } from 'react'

import Grid from '@mui/material/Grid2'

// Component Imports
import PurchaseCard from './PurchaseCard'
import PurchaseListTable from './PurchaseListTable' 

const PurchaseReport = ({ PurchaseReportData }) => {
  const [filterDate, setFilterDate] = useState('')


  // Function to filter data by selected date
  const handleFilterByDate = date => {
    setFilterDate(date)
  }

  // Filter & sort data
  const filteredData = useMemo(() => {
    let data = [...PurchaseReportData]

    // Filter by date if selected
    if (filterDate) {
      data = data.filter(item => item.date === filterDate)
    }

    // Sort by date (recent first)
    return data.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [PurchaseReportData, filterDate])

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <PurchaseCard PurchaseReportData={filteredData} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PurchaseListTable PurchaseReportData={filteredData} onFilterByDate={handleFilterByDate} />
        </Grid>
      </Grid>

     
    </>
  )
}

export default PurchaseReport
