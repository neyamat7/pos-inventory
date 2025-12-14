'use client'

import { useEffect, useState, useCallback } from 'react'

import DueList from '@/views/apps/dueList'
import { getSupplierDueList } from '@/actions/supplierAction'
import { getCustomerDueList } from '@/actions/customerActions'

const DueListPage = () => {
  // Single states for currently active data type
  const [selectedType, setSelectedType] = useState('suppliers') // 'suppliers' or 'customers'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  // Single states for current data
  const [tableData, setTableData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data based on selected type
  useEffect(() => {
    const fetchDueList = async () => {
      setIsLoading(true)

      try {
        let result

        if (selectedType === 'suppliers') {
          result = await getSupplierDueList({
            page: currentPage,
            limit: pageSize,
            search: searchTerm
          })
        } else {
          result = await getCustomerDueList({
            page: currentPage,
            limit: pageSize,
            search: searchTerm
          })
        }

        if (result.success) {
          // Set data based on type
          if (selectedType === 'suppliers') {
            setTableData(result.data.suppliers || [])
          } else {
            setTableData(result.data.customers || [])
          }

          setPaginationData({
            total: result.data.total,
            totalPages: result.data.totalPages,
            currentPage: result.data.page,
            limit: result.data.limit
          })
        }
      } catch (error) {
        console.error(`Error fetching ${selectedType} due list:`, error)
        setTableData([])
        setPaginationData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDueList()
  }, [selectedType, currentPage, pageSize, searchTerm])

  // Handle type change
  const handleTypeChange = newType => {
    setSelectedType(newType)
    setCurrentPage(1) // Reset to first page when changing type
    setSearchTerm('') // Reset search when changing type
  }

  // Handle page change
  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  // Handle page size change
  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page
  }

  // Handle search
  const handleSearch = useCallback(searchValue => {
    setSearchTerm(searchValue)
    setCurrentPage(1) // Reset to first page
  }, [])

  return (
    <DueList
      // Current data
      tableData={tableData}
      paginationData={paginationData}
      loading={isLoading}
      // Type selection
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      // Pagination & search handlers
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
      searchTerm={searchTerm}
    />
  )
}

export default DueListPage
