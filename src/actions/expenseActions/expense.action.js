'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function createExpense(expenseData) {
  // console.log('expense data in action', expenseData)

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

export async function createExpenseCategory(categoryData) {
  try {
    const response = await api.post('/expense-category/add', categoryData)

    revalidatePath('/apps/expenses/category')

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Create expense category error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create expense category'
    }
  }
}

export async function getExpenseCategories({ page = 1, limit = 10, name = '' } = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    // Add search query if provided
    if (name) {
      params.append('name', name)
    }

    const response = await api.get(`/expense-category/all?${params.toString()}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get expense categories error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch expense categories'
    }
  }
}

export async function updateExpenseCategory(id, categoryData) {
  try {
    const response = await api.put(`/expense-category/update/${id}`, categoryData)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Update expense category error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update expense category'
    }
  }
}

export async function deleteExpenseCategory(id) {
  try {
    const response = await api.delete(`/expense-category/delete/${id}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Delete expense category error:', error)

    return {
      success: false,
      error: error.message || 'Failed to delete expense category'
    }
  }
}

export async function addExtraExpense(id, data) {
  try {
    const response = await api.patch(`/expenses/add-extra-expense/${id}`, data)

    return {
      success: true,
      data: response,
      message: 'Extra expense added successfully'
    }
  } catch (error) {
    console.error('Add extra expense error:', error)

    return {
      success: false,
      error: error.message || 'Failed to add extra expense'
    }
  }
}


