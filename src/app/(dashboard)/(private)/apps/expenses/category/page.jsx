'use client'

import { useEffect, useState } from 'react'

import ExpenseCategoryTable from '@/views/apps/expenses/category'
import { getExpenseCategories } from '@/actions/expenseActions'
import { useAdmin } from '@/hooks/useAdmin'

export default function ExpenseCategoryPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  
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
    if (!isAdmin || adminLoading) return

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
  }, [currentPage, pageSize, searchTerm, isAdmin, adminLoading])

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

  // Show loading state
  if (adminLoading) {
    return <div className='flex items-center justify-center min-h-[50vh]'>Loading...</div>
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this page.</p>
      </div>
    )
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
