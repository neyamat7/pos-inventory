'use server'

import api from '@/libs/api'

export async function getAnalysisStats({ filter = 'daily' } = {}) {
  try {
    const params = new URLSearchParams({
      filter: filter
    })

    const response = await api.get(`/analysis/stats?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Analysis stats fetched successfully'
    }
  } catch (error) {
    console.error('Get analysis stats error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch analysis stats'
    }
  }
}

export async function getMonthlySummary() {
  try {
    const response = await api.get(`/analysis/monthly-summary`)

    console.log('monthly res', response)

    return {
      success: true,
      data: response,
      message: 'Monthly summary fetched successfully'
    }
  } catch (error) {
    console.error('Get monthly summary error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch monthly summary'
    }
  }
}
