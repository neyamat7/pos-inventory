// lib/api.js
import { auth } from '@/auth'

const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost:8000/api/v1'

async function api(endpoint, options = {}) {
  const { data, headers = {}, ...config } = options

  // Get the full session from NextAuth
  const session = await auth()

  // console.log('session in api', session)

  // Get the JWT token - NextAuth stores it in different ways depending on your setup
  // Option 1: If you store accessToken in session
  const token = session?.accessToken

  console.log('token in api', session)

  // Option 2: If your backend needs the NextAuth JWT itself, you'd need to get it differently
  // This requires accessing the token from cookies or using getToken from next-auth/jwt

  // Build headers
  const defaultHeaders = {
    'Content-Type': 'application/json'
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${JSON.stringify(session.accessToken)}`
  }

  // Build request config
  const fetchConfig = {
    ...config,
    headers: { ...defaultHeaders, ...headers }
  }

  // Add body if data is provided
  if (data) {
    fetchConfig.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${BASE_API_URL}${endpoint}`, fetchConfig)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))

      throw new Error(error.message || `Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Convenience methods
api.get = (endpoint, options = {}) => api(endpoint, { ...options, method: 'GET' })

api.post = (endpoint, data, options = {}) => api(endpoint, { ...options, method: 'POST', data })

api.put = (endpoint, data, options = {}) => api(endpoint, { ...options, method: 'PUT', data })

api.patch = (endpoint, data, options = {}) => api(endpoint, { ...options, method: 'PATCH', data })

api.delete = (endpoint, options = {}) => api(endpoint, { ...options, method: 'DELETE' })

export default api
