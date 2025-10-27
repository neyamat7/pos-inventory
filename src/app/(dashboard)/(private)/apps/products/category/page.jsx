'use client'

import { useState, useEffect } from 'react'

// Import the table component
import ProductCategoryTable from '@/views/apps/products/category/ProductCategoryTable'
import { getAllCategories } from '@/actions/categoryActions'

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

  return (
    <ProductCategoryTable
      categoryData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}

export default ProductCategory
