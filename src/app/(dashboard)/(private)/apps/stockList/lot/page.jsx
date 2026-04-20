'use client'
import { useEffect, useState } from 'react'

import { getAllLots, getDailyCashSummary } from '@/actions/lotActions'
import LotStockList from '@/views/apps/stockList/lot'

const LotPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cashSummary, setCashSummary] = useState(null)

  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllLots({ page: currentPage, limit: pageSize, search })

        setData(result?.lots?.lots || [])
        setPaginationData({
          total: result?.lots?.total,
          totalPages: result?.lots?.totalPages,
          currentPage: result?.lots?.page,
          limit: result?.lots?.limit
        })
      } catch (error) {
        console.error('Error fetching lots:', error)
        setData([])
        setPaginationData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, pageSize, search])

  // Fetch daily cash summary once on mount with today's date
  useEffect(() => {
    const fetchCashSummary = async () => {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`

      const result = await getDailyCashSummary(dateStr)

      if (result.success) {
        setCashSummary(result.data)
      }
    }

    fetchCashSummary()
  }, [])

  const handleSearchChange = value => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  return (
    <LotStockList
      lotData={data}
      paginationData={paginationData}
      loading={loading}
      cashSummary={cashSummary}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}
    />
  )
}

export default LotPage
