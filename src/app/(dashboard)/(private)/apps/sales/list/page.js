'use client'
import { useCallback, useEffect, useState } from 'react'

import { getAllSales } from '@/actions/saleActions'
import SalesList from '@/views/apps/sales/list'

const SalesListPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // console.log('sales data in sale page', data)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      const result = await getAllSales({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm
      })

      setData(result.sales || [])

      setPaginationData({
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        limit: result.limit
      })
    } catch (error) {
      console.error('Error fetching sales:', error)
      setData([])
      setPaginationData(null)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearchTerm])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleSearch = searchValue => {
    setSearchTerm(searchValue)
    setCurrentPage(1)
  }

  // console.log('search term', debouncedSearchTerm)

  return (
    <SalesList
      salesData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
      searchTerm={searchTerm}
      onRefresh={fetchData}
    />
  )
}

export default SalesListPage
