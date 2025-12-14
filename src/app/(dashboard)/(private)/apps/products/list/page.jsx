'use client'
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Data Imports
import { getAllProducts } from '@/actions/productActions'
import ProductListTable from '@/views/apps/products/list/ProductListTable'

const ProductsList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllProducts({ page: currentPage, limit: pageSize, search })

        setData(result.products || [])
        setPaginationData({
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit
        })
      } catch (error) {
        console.error('Error fetching products:', error)
        setData([])
        setPaginationData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, pageSize, search])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handleSearchChange = value => {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductListTable
          productData={data}
          paginationData={paginationData}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
        />
      </Grid>
    </Grid>
  )
}

export default ProductsList
