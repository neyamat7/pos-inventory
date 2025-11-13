'use server'

import api from '@/libs/api'

export async function uploadImage(formData) {
  console.log('formdata in action', formData)

  try {
    // Don't use api.post for FormData - use native fetch instead
    const response = await fetch(`${process.env.BASE_API_URL}/image/upload`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        data: result.data, // Make sure to access result.data
        message: 'Image uploaded successfully'
      }
    } else {
      return {
        success: false,
        error: result.message || 'Failed to upload image'
      }
    }
  } catch (error) {
    console.error('Upload image error:', error)

    return {
      success: false,
      error: error.message || 'Failed to upload image'
    }
  }
}
