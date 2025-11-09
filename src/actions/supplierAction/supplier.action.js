'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function createSupplier(supplierData) {
  try {
    const response = await api.post('/suppliers/add', supplierData)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Create supplier error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create supplier'
    }
  }
}

export async function getSuppliers(page = 1, limit = 10) {
  try {
    const response = await api.get(`/suppliers/all?page=${page}&limit=${limit}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get suppliers error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch suppliers'
    }
  }
}

export async function getSupplierById(supplierId) {
  try {
    const response = await api.get(`/suppliers/details/${supplierId}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get supplier by ID error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch supplier'
    }
  }
}

export async function updateSupplier(supplierId, supplierData) {
  try {
    const response = await api.put(`/suppliers/update/${supplierId}`, supplierData)

    // Revalidate the supplier details page
    revalidatePath(`/apps/suppliers/details/${supplierId}`)

    return {
      success: true,
      data: response,
      message: 'Supplier updated successfully'
    }
  } catch (error) {
    console.error('Update supplier error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update supplier'
    }
  }
}

export async function getLotsBySupplier(supplierId, page = 1, limit = 10, search = '', fromDate = '', toDate = '') {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) params.append('search', search)
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await api.get(`/inventoryLots/by-supplier/${supplierId}?${params.toString()}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get supplier lots error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch supplier lots'
    }
  }
}

export async function addBalance(balanceData) {
  try {
    const response = await api.post('/balance/add', balanceData)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Add balance error:', error)

    return {
      success: false,
      error: error.message || 'Failed to add balance'
    }
  }
}

export async function getPurchaseBySupplier(supplierId, page = 1, limit = 10, search = '', fromDate = '', toDate = '') {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) params.append('search', search)
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await api.get(`/purchase/by-supplier/${supplierId}?${params.toString()}`)

    // console.log('response', response)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Get purchase by supplier error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch supplier purchases'
    }
  }
}
