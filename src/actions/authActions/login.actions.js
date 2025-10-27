'use server'

import { signIn, signOut } from '@/auth'
import api from '@/libs/api'

export async function signOutAction() {
  await signOut({ callbackUrl: `${process.env.AUTH_URL}/login` })
}

export async function signInAction() {
  await signIn('google', { callbackUrl: `${process.env.AUTH_URL}/dashboard` })
}

export async function loginWithCredentials(formData) {
  try {
    const response = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    })

    // console.log('response in action', response)

    return response
  } catch (error) {
    throw error
  }
}

export async function getAllUsers({ page = 1, limit = 10 } = {}) {
  try {
    const data = await api.get(`/users?page=${page}&limit=${limit}`)

    // Return the full pagination info
    return {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || limit,
      totalPages: data.totalPages || 1,
      users: data.users || []
    }
  } catch (error) {
    console.error('Error fetching users:', error)

    return {
      total: 0,
      page: 1,
      limit,
      totalPages: 1,
      users: []
    }
  }
}
