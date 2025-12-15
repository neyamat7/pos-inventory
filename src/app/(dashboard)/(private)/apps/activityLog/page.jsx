'use client'
import { useState, useEffect } from 'react'

import { getAllActivityLogs } from '@/actions/activityLogActions'
import ActivityLogs from '@/views/apps/reports/activityLog'
import { useAdmin } from '@/hooks/useAdmin'

const ActivityLogPage = () => {
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin || adminLoading) return

    const fetchData = async () => {
      setLoading(true)

      try {
        const result = await getAllActivityLogs({ page: currentPage, limit: pageSize })

        setData(result.logs || [])
        setPaginationData({
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit
        })
      } catch (error) {
        console.error('Error fetching activity logs:', error)
        setData([])
        setPaginationData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, pageSize, isAdmin, adminLoading])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
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
    <ActivityLogs
      activityLogsData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  )
}

export default ActivityLogPage
