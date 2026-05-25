const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const ENABLE_CSRF = import.meta.env.VITE_ENABLE_CSRF === 'true'

let csrfToken = null

const isFormData = body => typeof FormData !== 'undefined' && body instanceof FormData

const buildUrl = endpoint => {
  if (/^https?:\/\//.test(endpoint)) return endpoint
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

const getCsrfToken = async () => {
  if (!ENABLE_CSRF || csrfToken) return csrfToken

  const response = await fetch(buildUrl('/security/csrf-token'), {
    credentials: 'include',
  })

  if (!response.ok) return null

  const payload = await response.json()
  csrfToken = payload.data?.csrfToken || null
  return csrfToken
}

export const apiRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET'
  const headers = new Headers(options.headers || {})

  if (options.body && !isFormData(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    const token = await getCsrfToken()
    if (token) headers.set('X-CSRF-Token', token)
  }

  const response = await fetch(buildUrl(endpoint), {
    ...options,
    method,
    credentials: 'include',
    headers,
    body: options.body && !isFormData(options.body) ? JSON.stringify(options.body) : options.body,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload
}
