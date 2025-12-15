'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

import { useSession } from 'next-auth/react'

import ExpenseListTable from '@/views/apps/expenses/list/ExpenseListTable'
import { getAllExpenses, getExpenseCategories } from '@/actions/expenseActions'
import { getAllUsers } from '@/actions/authActions'

const ExpensesList = () => {
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const isManager = session?.user?.role === 'manager'
  const isAuthorized = isAdmin || isManager
  const sessionLoading = status === 'loading'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Data state
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expenseCategories, setExpenseCategories] = useState([])
  const [usersList, setUsersList] = useState([])

  // Filter state - SPLIT into immediate and debounced
  const [filters, setFilters] = useState({
    category_id: '',
    user_id: '',
    date: '',
    search: ''
  })

  // Debounced filters - this is what triggers the API call
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Debounce timeout ref
  const debounceTimerRef = useRef(null)

  // Debounce the filters (only for search)
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timeout - only debounce if search changed
    if (filters.search !== debouncedFilters.search) {
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedFilters(filters)
      }, 500)
    } else {
      // For non-search filters, update immediately
      setDebouncedFilters(filters)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [filters])

  // Fetch data based on debounced filters
  useEffect(() => {
    if (!isAuthorized || sessionLoading) return

    const fetchExpenses = async () => {
      setLoading(true)

      try {
        const result = await getAllExpenses({
          page: currentPage,
          limit: pageSize,
          category: debouncedFilters.category_id || null,
          employeeId: debouncedFilters.user_id || null,
          date: debouncedFilters.date || null,
          search: debouncedFilters.search || ''
        })

        setData(result.expenses || [])
        setPaginationData({
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          limit: result.limit
        })
      } catch (error) {
        console.error('Error fetching expenses:', error)
        setData([])
        setPaginationData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [debouncedFilters, currentPage, pageSize, refreshTrigger, isAuthorized, sessionLoading])

  // Fetch expense categories
  useEffect(() => {
    if (!isAuthorized || sessionLoading) return

    const fetchCategories = async () => {
      try {
        const result = await getExpenseCategories({ page: 1, limit: 100 })

        if (result.success) {
          setExpenseCategories(result.data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching expense categories:', error)
        setExpenseCategories([])
      }
    }

    fetchCategories()
  }, [isAuthorized, sessionLoading])

  // Fetch users list
  useEffect(() => {
    if (!isAuthorized || sessionLoading) return

    const fetchUsers = async () => {
      try {
        const result = await getAllUsers({ page: 1, limit: 100 })

        if (result.users) {
          setUsersList(result.users || [])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        setUsersList([])
      }
    }

    fetchUsers()
  }, [isAuthorized, sessionLoading])

  // Handle page change
  const handlePageChange = useCallback(newPage => {
    setCurrentPage(newPage)
  }, [])

  // Handle page size change
  const handlePageSizeChange = useCallback(newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }, [])

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))

    // Reset to page 1 when filters change
    setCurrentPage(1)
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      category_id: '',
      user_id: '',
      date: '',
      search: ''
    })
    setCurrentPage(1)
  }, [])

  if (sessionLoading) {
    return <div className='flex items-center justify-center min-h-[50vh]'>Loading...</div>
  }

  if (!isAuthorized) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <ExpenseListTable
      expenseData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      expenseCategories={expenseCategories}
      usersList={usersList}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      refreshData={() => {
        // Trigger a re-fetch by toggling a dummy state or calling the fetch function if exposed
        // Since fetchExpenses is inside useEffect, we can't call it directly.
        // But we can depend on a refresh trigger.
        // Let's create a refresh trigger state.
        setRefreshTrigger(prev => prev + 1)
      }}
    />
  )
}

export default ExpensesList
