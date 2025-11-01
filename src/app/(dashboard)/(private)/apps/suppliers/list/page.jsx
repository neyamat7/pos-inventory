'use client'

import { useEffect, useState } from 'react'

import SupplierListTable from '@/views/apps/suppliers/list/SupplierLIstTable'
import { getSuppliers } from '@/actions/supplierAction'

const SupplierListTablePage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSuppliers(currentPage, pageSize)

      // console.log('result', result)

      if (result.success) {
        setData(result.data.suppliers || [])
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
    <SupplierListTable
      supplierData={data}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={setPageSize}
    />
  )
}

export default SupplierListTablePage
