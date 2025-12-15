'use client'
import { useState, useEffect } from 'react'

import AccountList from '@/views/apps/accounts/list'
import { getAccounts } from '@/actions/accountActions'

const AccountsListPage = () => {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const result = await getAccounts(currentPage, pageSize, searchQuery)

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
  }, [currentPage, pageSize, searchQuery])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handleSearch = query => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  return (
    <AccountList
      accountsData={data}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={setPageSize}
      onSearch={handleSearch}
      loading={loading}
    />
  )
}

export default AccountsListPage
