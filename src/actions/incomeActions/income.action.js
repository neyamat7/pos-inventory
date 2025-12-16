'use server'

import api from '@/libs/api'

export async function getAllIncomes({ page = 1, limit = 10 } = {}) {
  try {
    if (page < 1 || limit < 1) {
      return {
        success: false,
        error: 'Page and limit must be positive numbers'
      }
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await api.get(`/income/all?${params.toString()}`)

    return {
      success: true,
      data: response,
      message: 'Incomes fetched successfully'
    }
  } catch (error) {
    console.error('Get incomes error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch incomes'
    }
  }
}

export async function getIncomePeriods() {
  try {
    const response = await api.get('/income/periods')

    return {
      success: true,
      data: response.data,
      message: 'Income periods fetched successfully'
    }
  } catch (error) {
    console.error('Get income periods error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch income periods'
    }
  }
}

export async function getProfitLoss() {
  try {
    const response = await api.get('/inventoryLots/profit-loss')

    return {
      success: true,
      data: response.data,
      message: 'Profit loss data fetched successfully'
    }
  } catch (error) {
    console.error('Get profit loss error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch profit loss data'
    }
  }
}

export async function getLotsAnalytics({ page = 1, limit = 10, month, supplierId } = {}) {
  try {
    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())
    if (month) params.append('month', month)
    if (supplierId) params.append('supplierId', supplierId)

    const response = await api.get(`/inventoryLots/analytics?${params.toString()}`)

    return {
      success: true,
      data: response,
      message: 'Analytics fetched successfully'
    }
  } catch (error) {
    console.error('Get lots analytics error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch analytics'
    }
  }
}

