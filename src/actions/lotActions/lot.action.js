'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function getAllLots({ page = 1, limit = 10, search = '' } = {}) {
  try {
    const data = await api.get(`/inventoryLots/all?page=${page}&limit=${limit}&search=${search}`)

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

export async function getInStockLots() {
  try {
    const data = await api.get(`/inventoryLots/in-stock`)

    return {
      lots: data.data || []
    }
  } catch (error) {
    console.error('Error fetching in-stock lots:', error)

    return {
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

export async function checkDuplicateLotName(lot_name) {
  try {
    const data = await api.get(`/inventoryLots/check-name?lot_name=${lot_name}`)

    return data.isDuplicate
  } catch (error) {
    console.error('Error checking duplicate lot name:', error)

    return false
  }
}

export async function getUnpaidStockOutLots() {
  try {
    const response = await api.get('/inventoryLots/unpaid-stock-out')

    return {
      success: true,
      data: response.data,
      message: 'Unpaid stock-out lots fetched successfully'
    }
  } catch (error) {
    console.error('Get unpaid stock-out lots error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch unpaid stock-out lots'
    }
  }
}

export async function adjustStock(lotId, adjustmentData) {
  try {
    const response = await api.patch(`/inventoryLots/${lotId}/adjust-stock`, adjustmentData)

    return {
      success: true,
      data: response.data,
      message: 'Stock adjusted successfully'
    }
  } catch (error) {
    console.error('Adjust stock error:', error)

    return {
      success: false,
      error: error.message || 'Failed to adjust stock'
    }
  }
}

export async function getLotSaleSummary(lotId) {
  try {
    const response = await api.get(`/sale/lot-sale-summary/${lotId}`)

    return {
      success: true,
      data: response.data,
      message: 'Lot sale summary fetched successfully'
    }
  } catch (error) {
    console.error('Get lot sale summary error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch lot sale summary'
    }
  }
}

export async function updateLotExtraExpense(lotId, data) {
  try {
    const response = await api.patch(`/inventoryLots/${lotId}/extra-expense`, data)

    return {
      success: true,
      data: response.data,
      message: 'Extra expense updated successfully'
    }
  } catch (error) {
    console.error('Update extra expense error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update extra expense'
    }
  }
}
