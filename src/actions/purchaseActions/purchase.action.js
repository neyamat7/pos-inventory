'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function createPurchase(purchaseData) {
  // console.log('purchase data in action', purchaseData)

  try {
    const response = await api.post('/purchase/add', purchaseData)

    return {
      success: true,
      data: response,
      message: 'Purchase created successfully'
    }
  } catch (error) {
    console.error('Create purchase error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create purchase'
    }
  }
}

export async function getAllPurchases({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/purchase/all?page=${page}&limit=${limit}`)

    return {
      total: data?.data?.total || 0,
      page: data?.data?.page || 1,
      limit: data?.data?.limit || limit,
      totalPages: data?.data?.totalPages || 1,
      purchases: data?.data?.purchase || []
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

export async function createLots(purchaseId) {
  // console.log('purchase id in action', purchaseId)

  try {
    const response = await api.post(`/inventoryLots/add/?id=${purchaseId}`)

    revalidatePath('/apps/purchase/list')

    return {
      success: true,
      data: response,
      message: response.message || 'Lots created successfully'
    }
  } catch (error) {
    console.error('Create lots error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create lots'
    }
  }
}

export async function updatePurchaseStatus(purchaseId, status) {
  // console.log('update status in action', purchaseId, status)

  try {
    const response = await api.patch(`/purchase/status/${purchaseId}`, { status })

    revalidatePath('/apps/purchase/list')

    return {
      success: true,
      data: response,
      message: 'Status updated successfully'
    }
  } catch (error) {
    console.error('Update status error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update status'
    }
  }
}

