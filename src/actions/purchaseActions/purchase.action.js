'use server'

import api from '@/libs/api'

export async function getAllPurchases({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/purchase/all?page=${page}&limit=${limit}`)

    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      purchases: data.purchase || []
    }
  } catch (error) {
    console.error('Error fetching purchases:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      purchases: []
    }
  }
}
