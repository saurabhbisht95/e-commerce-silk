const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'
const ENABLE_CSRF = import.meta.env.VITE_ENABLE_CSRF === 'true'

let csrfToken = null
let refreshPromise = null

export class ApiRequestError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = details.status || 0
    this.payload = details.payload || null
    this.data = details.payload?.data || null
  }
}

const isFormData = body => typeof FormData !== 'undefined' && body instanceof FormData

const buildUrl = endpoint => {
  if (/^https?:\/\//.test(endpoint)) return endpoint
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

const apiOrigin = (() => {
  try {
    return /^https?:\/\//.test(API_BASE_URL) ? new URL(API_BASE_URL).origin : ''
  } catch {
    return ''
  }
})()

export const resolveApiAssetUrl = url => {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || /^data:/.test(url) || /^blob:/.test(url)) return url
  if (url.startsWith('/uploads')) return apiOrigin ? `${apiOrigin}${url}` : url
  return url
}

const getEndpointPath = endpoint => {
  if (/^https?:\/\//.test(endpoint)) {
    try {
      return new URL(endpoint).pathname.replace(/\/api\/v1/, '')
    } catch {
      return endpoint
    }
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
}

const canRefreshForEndpoint = endpoint => {
  const path = getEndpointPath(endpoint)
  return ![
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh-token',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
  ].some(authPath => path.startsWith(authPath))
}

const getCsrfToken = async () => {
  if (!ENABLE_CSRF || csrfToken) return csrfToken

  let response

  try {
    response = await fetch(buildUrl('/security/csrf-token'), {
      credentials: 'include',
    })
  } catch {
    return null
  }

  if (!response.ok) return null

  const payload = await response.json()
  csrfToken = payload.data?.csrfToken || null
  return csrfToken
}

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const headers = new Headers({ 'Content-Type': 'application/json' })
      const token = await getCsrfToken()
      if (token) headers.set('X-CSRF-Token', token)

      const response = await fetch(buildUrl('/auth/refresh-token'), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({}),
      })

      if (!response.ok) throw new Error('Refresh token expired')
      return response.json()
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const apiRequest = async (endpoint, options = {}, retryState = { hasRetried: false }) => {
  const method = options.method || 'GET'
  const headers = new Headers(options.headers || {})

  if (options.body && !isFormData(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    const token = await getCsrfToken()
    if (token) headers.set('X-CSRF-Token', token)
  }

  let response

  try {
    response = await fetch(buildUrl(endpoint), {
      ...options,
      method,
      credentials: 'include',
      headers,
      body: options.body && !isFormData(options.body) ? JSON.stringify(options.body) : options.body,
    })
  } catch {
    throw new ApiRequestError('Unable to reach the backend. Please make sure the API server is running and MongoDB Atlas is reachable.')
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    if (response.status === 401 && !retryState.hasRetried && canRefreshForEndpoint(endpoint)) {
      try {
        await refreshSession()
        return apiRequest(endpoint, options, { hasRetried: true })
      } catch {
        // Keep the original endpoint error so UI messages stay tied to the user's action.
      }
    }

    const message = payload?.message || `Request failed with status ${response.status}`
    throw new ApiRequestError(message, { status: response.status, payload })
  }

  return payload
}
