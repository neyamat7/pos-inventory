'use client'

import { useEffect, useState } from 'react'

import { getSuppliers } from '@/actions/supplierAction'
import SupplierListTable from '@/views/apps/suppliers/list/SupplierLIstTable'

const SupplierListTablePage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const result = await getSuppliers(currentPage, pageSize, debouncedSearch)

      if (result.success) {
        setData(result.data.suppliers || [])
        setPaginationData({
          total: result.data.total,
          totalPages: result.data.totalPages,
          currentPage: result.data.page,
          limit: result.data.limit
        })
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
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

  return (
    <SupplierListTable
      supplierData={data}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={setPageSize}
      isLoading={isLoading}
      refreshData={fetchData}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    />
  )
}

export default SupplierListTablePage
