'use server'

import api from '@/libs/api'

export async function getAllProducts({ page = 1, limit = 10, search = '' } = {}) {
  try {
    const data = await api.get(`/products/all?page=${page}&limit=${limit}&search=${search}`)

    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      products: data.products || []
    }
  } catch (error) {
    console.error('Error fetching products:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      products: []
    }
  }
}

export async function getProductById(productId) {
  try {
    const data = await api.get(`/products/details/${productId}`)

    return {
      success: true,
      data: data,
      message: 'Product fetched successfully'
    }
  } catch (error) {
    console.error('Get product by ID error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch product'
    }
  }
}

export async function createProduct(productData) {
  try {
    const response = await api.post('/products/add', productData)

    return {
      success: true,
      data: response,
      message: 'Product created successfully'
    }
  } catch (error) {
    console.error('Create product error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create product'
    }
  }
}

export async function updateProduct(productId, productData) {
  try {
    const response = await api.put(`/products/update/${productId}`, productData)

    return {
      success: true,
      data: response,
      message: 'Product updated successfully'
    }
  } catch (error) {
    console.error('Update product error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update product'
    }
  }
}
