'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function getAllLots({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/inventoryLots/all?page=${page}&limit=${limit}`)

    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      lots: data.lots || []
    }
  } catch (error) {
    console.error('Error fetching lots:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      lots: []
    }
  }
}

export async function updateLotStatus(lotId, status) {
  try {
    const data = await api.put(`/inventoryLots/status/${lotId}`, { status })

    revalidatePath('/apps/stockList/lot')

    return {
      success: true,
      message: 'Lot status updated successfully',
      data
    }
  } catch (error) {
    console.error('Error updating lot status:', error)

    return {
      success: false,
      message: `Failed to update lot status: ${error.message}`
    }
  }
}
