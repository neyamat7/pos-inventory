'use server'

import api from '@/libs/api'

export async function getBalanceHistory(id, page = 1, limit = 10, fromDate = '', toDate = '') {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await api.get(`/balance/all/${id}?${params.toString()}`)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Get balance history error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch balance history'
    }
  }
}
