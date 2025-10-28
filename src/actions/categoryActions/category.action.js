'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function createCategory(categoryData) {
  try {
    const response = await api.post('/categories/add', categoryData)

    revalidatePath('/apps/products/category')

    return {
      success: true,
      data: response,
      message: 'Category created successfully'
    }
  } catch (error) {
    console.error('Create category error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create category'
    }
  }  
}

export async function getAllCategories({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/categories/all?page=${page}&limit=${limit}`)

    // Return the full pagination info
    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      categories: data.categories || []
    }
  } catch (error) {
    console.error('Error fetching categories:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      categories: []
    }
  }
}

export async function updateCategory(categoryId, categoryData) {
  try {
    const response = await api.put(`/categories/update/${categoryId}`, categoryData)

    return {
      success: true,
      data: response,
      message: 'Category updated successfully'
    }
  } catch (error) {
    console.error('Update category error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update category'
    }
  }
}

export async function deleteCategory(categoryId) {
  try {
    const response = await api.delete(`/categories/delete/${categoryId}`)

    return {
      success: true,
      data: response,
      message: 'Category deleted successfully'
    }
  } catch (error) {
    console.error('Delete category error:', error)

    return {
      success: false,
      error: error.message || 'Failed to delete category'
    }
  }
}
