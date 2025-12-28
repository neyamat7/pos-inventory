'use client'

import { useEffect, useState } from 'react'

// Import the table component
import { getAllCategories } from '@/actions/categoryActions'
import ProductCategoryTable from '@/views/apps/products/category/ProductCategoryTable'

const ProductCategory = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllCategories({ page: currentPage, limit: pageSize })

        setData(result.categories || [])
        setPaginationData({
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit
        })

      } catch (error) {
        
        console.error('Error fetching categories:', error)
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
    setCurrentPage(1) // Reset to first page when page size changes
  }

  // Function to refresh data (can be called after adding/editing categories)
  const refreshData = async () => {
    setLoading(true)

    try {
      const result = await getAllCategories({ page: currentPage, limit: pageSize })

      setData(result.categories || [])
      setPaginationData({
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        limit: result.limit
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      setData([])
      setPaginationData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProductCategoryTable
      categoryData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onRefresh={refreshData}
    />
  )
}

export default ProductCategory
