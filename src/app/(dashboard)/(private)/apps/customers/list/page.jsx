'use client'
import { useEffect, useState } from 'react'

import { getCustomers } from '@/actions/customerActions'
import CustomerListTable from '@/views/apps/customers/list/CustomerListTable'

const CustomerListTablePage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const result = await getCustomers(currentPage, pageSize, debouncedSearch)

      if (result.success) {
        setData(result.data.customers || [])
        setPaginationData({
          total: result.data.total,
          totalPages: result.data.totalPages,
          currentPage: result.data.page,
          limit: result.data.limit
        })
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize, debouncedSearch])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handleSearchChange = value => {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <CustomerListTable
      customerData={data}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={setPageSize}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      refreshData={fetchData}
      searchValue={search}
    />
  )
}

export default CustomerListTablePage
