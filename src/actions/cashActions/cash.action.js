'use server'

import api from '@/libs/api'

export async function getDailyCash(date) {
  try {
    const params = new URLSearchParams({
      date: date
    })

    const response = await api.get(`/daily-cash?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Daily cash fetched successfully'
    }
  } catch (error) {
    console.error('Get daily cash error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch daily cash'
    }
  }
}

export async function getDailyCashHistory({ date, year, month, page = 1, limit = 10 }) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (date) params.append('date', date)
    if (year) params.append('year', year)
    if (month) params.append('month', month)

    const response = await api.get(`/daily-cash/history?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Cash transaction history fetched successfully'
    }
  } catch (error) {
    console.error('Get cash transaction history error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch cash transaction history'
    }
  }
}

export async function addCashIn({ date, amount, note }) {
  try {
    const response = await api.post('/daily-cash/cash-in', {
      date,
      amount,
      note
    })

    return {
      success: true,
      data: response.data,
      message: 'Cash-in added successfully'
    }
  } catch (error) {
    console.error('Add cash-in error:', error)

    return {
      success: false,
      error: error.message || 'Failed to add cash-in'
    }
  }
}

export async function addCashOut({ date, amount, note }) {
  try {
    const response = await api.post('/daily-cash/cash-out', {
      date,
      amount,
      note
    })

    return {
      success: true,
      data: response.data,
      message: 'Cash-out added successfully'
    }
  } catch (error) {
    console.error('Add cash-out error:', error)

    return {
      success: false,
      error: error.message || 'Failed to add cash-out'
    }
  }
}

