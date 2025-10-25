// Base API configuration
const BASE_API_URL = process.env.BASE_API_URL || 'http://localhost:8000/api/v1'

// Common headers
const getHeaders = (token = null, customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Handle response
const handleResponse = async response => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }))

    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const { method = 'GET', data = null, token = null, headers: customHeaders = {}, ...fetchOptions } = options

  const url = `${BASE_API_URL}${endpoint}`

  const config = {
    method,
    headers: getHeaders(token, customHeaders),
    ...fetchOptions
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, config)

    return await handleResponse(response)
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Specific HTTP method functions
const api = {
  // GET request
  get: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: (endpoint, data, options = {}) => apiCall(endpoint, { ...options, method: 'POST', data }),

  // PUT request
  put: (endpoint, data, options = {}) => apiCall(endpoint, { ...options, method: 'PUT', data }),

  // PATCH request
  patch: (endpoint, data, options = {}) => apiCall(endpoint, { ...options, method: 'PATCH', data }),

  // DELETE request
  delete: (endpoint, options = {}) => apiCall(endpoint, { ...options, method: 'DELETE' })
}

export default api
