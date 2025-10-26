'use client'
import { useState, useEffect } from 'react'

import { getCustomers } from '@/actions/customerActions'
import CustomerListTable from '@views/apps/ecommerce/customers/list/CustomerListTable'

const CustomerListTablePage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const result = await getCustomers(currentPage, pageSize)

      if (result.success) {
        setData(result.data.customers || [])
        setPaginationData({
          total: result.data.total,
          totalPages: result.data.totalPages,
          currentPage: result.data.page,
          limit: result.data.limit
        })
      }
    }

    fetchData()
  }, [currentPage, pageSize])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  return (
    <CustomerListTable
      customerData={data}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={setPageSize}
    />
  )
}

export default CustomerListTablePage
