'use server'

import api from '@/libs/api'

export async function createSale(saleData) {
  //   console.log('sale data in action', saleData)

  try {
    const response = await api.post('/sale/add', saleData)

    return {
      success: true,
      data: response,
      message: 'Sale created successfully'
    }
  } catch (error) {
    console.error('Create sale error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create sale'
    }
  }
}

export async function getAllSales({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/sale/all?page=${page}&limit=${limit}`)

    console.log('data in action', data)

    return {
      total: data?.data?.totalItems || 0,
      page: data?.data?.pagination?.currentPage || 1,
      limit: data?.data?.pagination?.limit || limit,
      totalPages: data?.data?.pagination?.totalPages || 1,
      sales: data?.data?.sales || []
    }
  } catch (error) {
    console.error('Error fetching sales:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      sales: []
    }
  }
}

