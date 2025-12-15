'use server'

import { revalidatePath } from 'next/cache'

import api from '@/libs/api'

export async function addAccount(accountData) {
  try {
    // Validate required fields
    if (!accountData || typeof accountData !== 'object') {
      return {
        success: false,
        error: 'Account data is required'
      }
    }

    const requiredFields = ['name', 'account_type']
    const missingFields = requiredFields.filter(field => !accountData[field])

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    const validAccountTypes = ['bank', 'mobile_wallet', 'cash']

    if (!validAccountTypes.includes(accountData.account_type)) {
      return {
        success: false,
        error: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`
      }
    }

    // Make API call to create account
    const response = await api.post('/account/add', accountData)

    // Revalidate accounts page if you have one
    revalidatePath('/accounts')

    return {
      success: true,
      data: response,
      message: 'Account created successfully'
    }
  } catch (error) {
    console.error('Add account error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create account'
    }
  }
}

export async function getAccounts(page = 1, limit = 10, search = '') {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (search) {
      params.append('search', search)
    }

    const response = await api.get(`/account/all?${params.toString()}`)

    // console.log('response', response)

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get accounts error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch accounts'
    }
  }
}

export async function updateAccount(accountId, accountData) {
  try {
    const response = await api.put(`/account/update/${accountId}`, accountData)

    return {
      success: true,
      data: response,
      message: 'Account updated successfully'
    }
  } catch (error) {
    console.error('Update account error:', error)

    return {
      success: false,
      error: error.message || 'Failed to update account'
    }
  }
}
