'use client'
import { useState, useEffect } from 'react'

import LotStockList from '@/views/apps/stockList/lot'
import { getAllLots } from '@/actions/lotActions'

const LotPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)

  // console.log('lot data in lot page', data)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllLots({ page: currentPage, limit: pageSize })

        // console.log('result', result)

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
  }, [currentPage, pageSize])

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
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}

export default LotPage
