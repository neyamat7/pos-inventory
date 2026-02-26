// lib/api.js
import { auth } from '@/auth'

const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost:8000/api/v1'

async function api(endpoint, options = {}) {
  const { data, headers = {}, ...config } = options

  const session = await auth()

  const token = session?.accessToken

  // console.log('token in api', session)

  const isFormData = data instanceof FormData

  const defaultHeaders = {}

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${session.accessToken}`
  }

  const fetchConfig = {
    ...config,
    headers: { ...defaultHeaders, ...headers }
  }

  if (data) {
    fetchConfig.body = isFormData ? data : JSON.stringify(data)
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
