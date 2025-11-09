'use server'

import api from '@/libs/api'

export async function addCrates(crateData) {
  try {
    if (!crateData || typeof crateData !== 'object') {
      return {
        success: false,
        error: 'Crate data is required'
      }
    }

    const { date, crate_type_1_qty, crate_type_2_qty, crate_type_1_price, crate_type_2_price, note } = crateData

    const response = await api.post('/crates/add', {
      date,
      crate_type_1_qty,
      crate_type_2_qty,
      crate_type_1_price,
      crate_type_2_price,
      note
    })

    return {
      success: true,
      data: response,
      message: 'Crates added successfully'
    }
  } catch (error) {
    console.error('Add crates error:', error)

    return {
      success: false,
      error: error.message || 'Failed to add crates'
    }
  }
}

export async function addCratesForSupplier(supplierId, crateInfo) {
  try {
    // Validate required fields
    if (!supplierId || !crateInfo || typeof crateInfo !== 'object') {
      return {
        success: false,
        error: 'Supplier ID and crate info are required'
      }
    }

    const { crate1, crate2, crate1Price, crate2Price } = crateInfo

    // Make API call to send crates to supplier
    const response = await api.post(`/crates/sent-to-supplier/${supplierId}`, {
      crate1,
      crate2,
      crate1Price,
      crate2Price
    })

    return {
      success: true,
      data: response,
      message: 'Crates sent to supplier successfully'
    }
  } catch (error) {
    console.error('Send crates to supplier error:', error)

    return {
      success: false,
      error: error.message || 'Failed to send crates to supplier'
    }
  }
}

export async function updateCrates(query, crateInfo) {
  try {
    // Validate required fields
    // if (!query || !crateInfo || typeof crateInfo !== 'object') {
    //   return {
    //     success: false,
    //     error: 'Query and crate info are required'
    //   }
    // }

    const { supplierId } = query
    const { crate1, crate2, crate1Price, crate2Price } = crateInfo

    // Make API call to update crates
    const response = await api.patch('/crates/update', {
      supplierId,
      crate1,
      crate2,
      crate1Price,
      crate2Price
    })

    return {
      success: true,
      data: response,
      message: supplierId ? 'Supplier crates updated successfully' : 'Crate totals updated successfully'
    }
  } catch (error) {
    console.error('Update crates error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update crates'
    }
  }
}

export async function getAllCrateTransactions(page = 1, limit = 10, searchTerm = '') {
  try {
    if (page < 1 || limit < 1) {
      return {
        success: false,
        error: 'Page and limit must be positive numbers'
      }
    }

    // Build query parameters cleanly
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    // Add search term only if provided
    if (searchTerm?.trim()) {
      params.append('search', searchTerm.trim())
    }

    const response = await api.get(`/crates/all?${params.toString()}`)

    return {
      success: true,
      data: response.data,
      message: 'Crate transactions fetched successfully'
    }
  } catch (error) {
    console.error('Get crate transactions error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch crate transactions'
    }
  }
}
