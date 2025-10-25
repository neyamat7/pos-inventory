'use server'

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
