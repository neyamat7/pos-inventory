'use client'
import { useState, useEffect, useCallback } from 'react'

import SalesList from '@/views/apps/sales/list'
import { getAllSales } from '@/actions/saleActions'

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllSales({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm
        })

        // console.log('API Response:', result)
        // console.log('Total Pages:', result.totalPages)
        // console.log('Total Items:', result.total)

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
    }

    fetchData()
  }, [currentPage, pageSize, debouncedSearchTerm])

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
    />
  )
}

export default SalesListPage
