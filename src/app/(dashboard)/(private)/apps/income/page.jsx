'use client'
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Data Imports
import { getAllIncomes } from '@/actions/incomeActions'
import ShowIncomePage from '@/views/apps/income'

// import ShowIncomePage from '@/views/apps/income'

const IncomePage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllIncomes({ page: currentPage, limit: pageSize })

        // console.log('income result', result)

        if (result.success) {
          setData(result.data.incomes || [])
          setPaginationData({
            total: result.data.total,
            totalPages: result.data.totalPages,
            currentPage: result.data.page,
            limit: result.data.limit
          })
        } else {
          setData([])
          setPaginationData(null)
        }
      } catch (error) {
        console.error('Error fetching incomes:', error)
        setData([])
        setPaginationData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, pageSize])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  return (
    <ShowIncomePage
      incomeData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}

export default IncomePage
