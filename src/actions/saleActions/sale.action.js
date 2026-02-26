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

export async function getAllSales({ page = 1, limit = 10, search = '' } = {}) {
  try {
    const data = await api.get(`/sale/all?page=${page}&limit=${limit}&search=${search}`)

    // console.log('data in action', data)

    return {
      total: data?.data?.total || 0,
      page: data?.data?.page || 1,
      limit: data?.data?.limit || limit,
      totalPages: data?.data?.totalPages || 1,
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

export async function deleteSale(saleId) {
  try {
    const response = await api.delete(`/sale/${saleId}`)

    return {
      success: true,
      message: response.message || 'Sale deleted successfully'
    }
  } catch (error) {
    console.error('Delete sale error:', error)

    return {
      success: false,
      error: error.message || 'Failed to delete sale'
    }
  }
}
