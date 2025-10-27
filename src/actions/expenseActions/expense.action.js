'use server'

import api from '@/libs/api'

export async function createExpense(expenseData) {
  try {
    const response = await api.post('/expenses/add', expenseData)

    return {
      success: true,
      data: response,
      message: 'Expense created successfully'
    }
  } catch (error) {
    console.error('Create expense error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create expense'
    }
  }
}

export async function getAllExpenses({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/expenses/all?page=${page}&limit=${limit}`)

    // Return the full pagination info
    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      expenses: data.expenses || []
    }
  } catch (error) {
    console.error('Error fetching expenses:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      expenses: []
    }
  }
}

export async function updateExpense(expenseId, expenseData) {
  try {
    const response = await api.put(`/expenses/update/${expenseId}`, expenseData)

    return {
      success: true,
      data: response,
      message: 'Expense updated successfully'
    }
  } catch (error) {
    console.error('Update expense error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update expense'
    }
  }
}
