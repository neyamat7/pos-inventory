'use client'

import { useEffect, useState } from 'react'

import ExpenseCategoryTable from '@/views/apps/expenses/category'
import { getExpenseCategories } from '@/actions/expenseActions'

export default function ExpenseCategoryPage() {
  // State for expense categories data
  const [categoryData, setCategoryData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch expense categories data
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true)

      try {
        const result = await getExpenseCategories({
          page: currentPage,
          limit: pageSize,
          name: searchTerm
        })

        if (result.success) {
          setCategoryData(result.data.categories || [])
          setPaginationData({
            total: result.data.total,
            totalPages: result.data.totalPages,
            currentPage: result.data.page,
            limit: result.data.limit
          })
        }
      } catch (error) {
        console.error('Error fetching expense categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [currentPage, pageSize, searchTerm])

  // Handle page change
  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  // Handle page size change
  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  // Handle search
  const handleSearch = searchValue => {
    setSearchTerm(searchValue)
    setCurrentPage(1)
  }

  const handleRefresh = async () => {
    setLoading(true)

    try {
      const result = await getExpenseCategories({
        page: currentPage,
        limit: pageSize,
        name: searchTerm
      })

      if (result.success) {
        setCategoryData(result.data.categories || [])
        setPaginationData({
          total: result.data.total,
          totalPages: result.data.totalPages,
          currentPage: result.data.page,
          limit: result.data.limit
        })
      }
    } catch (error) {
      console.error('Error refreshing expense categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ExpenseCategoryTable
      categoryData={categoryData}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
      onRefresh={handleRefresh}
      searchTerm={searchTerm}
    />
  )
}
