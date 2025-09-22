'use server'

import { signIn, signOut } from '@/auth'

export async function signOutAction() {
  await signOut({ callbackUrl: 'https://pos-inventory-gamma.vercel.app/login' })
}

export async function signInAction() {
  await signIn('google', { callbackUrl: 'https://pos-inventory-gamma.vercel.app/dashboard' })
}

export async function loginWithCredentials(formData) {
  try {
    const response = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    })

    // console.log('response in auth action', response)

    return response
  } catch (error) {
    throw error
  }
}
