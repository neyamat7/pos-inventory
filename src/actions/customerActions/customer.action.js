'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function createCustomer(customerData) {
  try {
    // Validate required fields
    if (!customerData || typeof customerData !== 'object') {
      return {
        success: false,
        error: 'Customer data is required'
      }
    }

    // Make API call to create customer without token
    const response = await api.post('/customer/add', customerData)

    return {
      success: true,
      data: response,
      message: 'Customer created successfully'
    }
  } catch (error) {
    console.error('Create customer error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create customer'
    }
  }
}

export async function getCustomers(page, limit, search = '') {
  try {
    const response = await api.get(`/customer/all?page=${page}&limit=${limit}&search=${search}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get customers error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch customers'
    }
  }
}

export async function getCustomerById(customerId) {
  try {
    const response = await api.get(`/customer/details/${customerId}`)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Get customer by ID error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch customer'
    }
  }
}

export async function updateCustomer(customerId, customerData) {
  try {
    const response = await api.put(`/customer/update/${customerId}`, customerData)

    // Add this line:
    revalidatePath(`/apps/customers/details/${customerId}`)

    return {
      success: true,
      data: response,
      message: 'Customer updated successfully'
    }
  } catch (error) {
    console.error('Update customer error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update customer'
    }
  }
}

export async function getSalesByCustomer(customerId, page = 1, limit = 10, search = '', fromDate = '', toDate = '') {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) params.append('search', search)
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)

    const response = await api.get(`/sale/by-customer/${customerId}?${params.toString()}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get customer sales error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch customer sales'
    }
  }
}

export async function getCustomerDueList({ page = 1, limit = 10 } = {}) {
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

    const response = await api.get(`/customer/due-list?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Customer due list fetched successfully'
    }
  } catch (error) {
    console.error('Get customer due list error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch customer due list'
    }
  }
}

export async function getCustomerCrateHistory(customerId, page = 1, limit = 10) {
  try {
    const response = await api.get(`/customer-crate-history/${customerId}?page=${page}&limit=${limit}`)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get customer crate history error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch customer crate history'
    }
  }
}

export async function updateCrateStatus(id, status) {
  try {
    const response = await api.patch(`/customer-crate-history/status/${id}`, { status })

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Update crate status error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update crate status'
    }
  }
}
