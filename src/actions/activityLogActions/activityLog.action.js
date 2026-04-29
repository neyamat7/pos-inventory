'use server'

import api from '@/libs/api'

export async function getAllActivityLogs({ page = 1, limit = 10, action, by, model_name } = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (action) params.append('action', action)
    if (by) params.append('by', by)
    if (model_name) params.append('model_name', model_name)

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

export async function getActivityLogDetails(id) {
  try {
    const data = await api.get(`/activity/details/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching activity log details:', error)
    return { success: false, data: null, error: error.message }
  }
}
