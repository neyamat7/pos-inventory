'use server'

import api from '@/libs/api'

export async function getAllActivityLogs({ page = 1, limit = 10, action, by } = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (action) params.append('action', action)
    if (by) params.append('by', by)

    const data = await api.get(`/activity/all?${params.toString()}`)

    // Return the full pagination info
    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      logs: data.logs || []
    }
  } catch (error) {
    console.error('Error fetching activity logs:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      logs: []
    }
  }
}
