'use client'
import { useState, useEffect } from 'react'

import ExpenseListTable from '@/views/apps/expenses/list/ExpenseListTable'
import { getAllExpenses, getExpenseCategories } from '@/actions/expenseActions'

const ExpensesList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [data, setData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expenseCategories, setExpenseCategories] = useState([])

  useEffect(() => {
    setLoading(true)

    const fetchData = async () => {
      try {
        const result = await getAllExpenses({ page: currentPage, limit: pageSize })

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

    fetchData()
  }, [currentPage, pageSize])

  useEffect(() => {
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
  }, [])

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = newSize => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  return (
    <ExpenseListTable
      expenseData={data}
      paginationData={paginationData}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      expenseCategories={expenseCategories}
    />
  )
}

export default ExpensesList
