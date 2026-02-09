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

export async function getSuppliers(page = 1, limit = 100, search = '') {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) params.append('search', search)

    const response = await api.get(`/suppliers/all?${params.toString()}`)

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

export async function addPayment(paymentData) {
  
  try {
    const response = await api.post('/payment/add', paymentData)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Add payment error:', error)

    return {
      success: false,
      error: error.message || 'Failed to add payment'
    }
  }
}

export async function getSupplierPayments({ supplierId, page = 1, limit = 10, fromDate = '', toDate = '' }) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await api.get(`/payment/all/${supplierId}?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Supplier payments fetched successfully'
    }
  } catch (error) {
    console.error('Get supplier payments error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch supplier payments'
    }
  }
}


export async function getSupplierDueList({ page = 1, limit = 10 } = {}) {
  try {
    if (page < 1 || limit < 1) {
      return {
        success: false,
        error: 'Page and limit must be positive numbers'
      }
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await api.get(`/suppliers/due-list?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Supplier due list fetched successfully'
    }
  } catch (error) {
    console.error('Get supplier due list error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch supplier due list'
    }
  }
}

// Archive supplier (soft delete)
export async function archiveSupplier(supplierId) {
  try {
    const response = await api.delete(`/suppliers/delete/${supplierId}`)
    
    // Revalidate the supplier list page
    revalidatePath('/apps/suppliers/list')
    
    return {
      success: true,
      data: response,
      message: 'Supplier archived successfully'
    }
  } catch (error) {
    console.error('Archive supplier error:', error)
    
    return {
      success: false,
      error: error.message || 'Failed to archive supplier'
    }
  }
}
