'use client'
import { useState, useEffect } from 'react'

import AccountList from '@/views/apps/accounts/list'
import { getAccounts } from '@/actions/accountActions'

const AccountsListPage = () => {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const result = await getAccounts(currentPage, pageSize)

      // console.log('result in acc page', result.data)
      setLoading(false)

      if (result.success) {
        setData(result.data.accounts || [])
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
    <AccountList
      accountsData={data}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={setPageSize}
      loading={loading}
    />
  )
}

export default AccountsListPage
