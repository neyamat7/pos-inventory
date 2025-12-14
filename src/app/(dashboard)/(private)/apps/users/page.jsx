'use client'
import { useState, useEffect } from 'react'

import UserList from '@/views/apps/users/list'
import { getAllUsers } from '@/actions/authActions'

import { useAdmin } from '@/hooks/useAdmin'

const UserListApp = () => {
  const { isAdmin, isLoading } = useAdmin()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)

  if (isLoading) {
    return <div className='flex items-center justify-center min-h-[50vh]'>Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this page.</p>
      </div>
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllUsers({ page: currentPage, limit: pageSize })

        setData(result.users || [])
        setPaginationData({
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit
        })
      } catch (error) {
        console.error('Error fetching users:', error)
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
    setCurrentPage(1)
  }

  // console.log('user', data)

  return (
    <UserList
      userData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}

export default UserListApp
