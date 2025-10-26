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

export async function getCustomers(page, limit) {
  try {
    const response = await api.get(`/customer/all?page=${page}&limit=${limit}`)

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
