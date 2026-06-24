// Keep production authentication same-origin through Netlify's reverse proxy.
// Calling Render directly makes refresh/CSRF cookies third-party cookies.
const API_BASE_URL = import.meta.env.PROD
  ? '/api/v1'
  : import.meta.env.VITE_API_URL || '/api/v1'
const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'
const ENABLE_CSRF = import.meta.env.VITE_ENABLE_CSRF === 'true'
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000)
const TOKEN_KEY = 'doon_silk_admin_access_token'

let csrfToken = null
let refreshPromise = null
let requestSubscriber = null

export const apiConfig = {
  apiBaseUrl: API_BASE_URL,
  storefrontUrl: STOREFRONT_URL,
  healthUrl: API_BASE_URL.includes('/api/v1') ? API_BASE_URL.replace(/\/api\/v1$/, '/healthz') : '/healthz',
  apiDocsUrl: API_BASE_URL.includes('/api/v1') ? API_BASE_URL.replace(/\/api\/v1$/, '/api-docs') : '/api-docs',
}

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = details.status || 0
    this.payload = details.payload || null
    this.requestId = details.requestId || null
  }
}

export const setRequestSubscriber = subscriber => {
  requestSubscriber = subscriber
}

export const tokenStore = {
  get() {
    return window.localStorage.getItem(TOKEN_KEY)
  },
  set(token) {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    window.localStorage.removeItem(TOKEN_KEY)
  },
}

const isFormData = body => typeof FormData !== 'undefined' && body instanceof FormData

const createRequestId = () =>
  globalThis.crypto?.randomUUID?.() || `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`

const fetchWithTimeout = async (url, options = {}) => {
  if (!API_TIMEOUT_MS || options.signal) return fetch(url, options)

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

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
  try {
    const response = await fetchWithTimeout(buildUrl('/security/csrf-token'), { credentials: 'include' })
    if (!response.ok) return null
    const payload = await response.json()
    csrfToken = payload.data?.csrfToken || null
    return csrfToken
  } catch {
    return null
  }
}

const recordRequest = entry => {
  requestSubscriber?.({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    time: new Date().toLocaleTimeString(),
    ...entry,
  })
}

const refreshAdminSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const headers = new Headers({ 'Content-Type': 'application/json' })
      headers.set('X-Request-Id', createRequestId())
      const tokenValue = await getCsrfToken()
      if (tokenValue) headers.set('X-CSRF-Token', tokenValue)

      const response = await fetchWithTimeout(buildUrl('/auth/refresh-token'), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({}),
      })
      const contentType = response.headers.get('content-type') || ''
      const payload = contentType.includes('application/json') ? await response.json() : null
      const requestId = response.headers.get('X-Request-Id')

      if (!response.ok) throw new ApiError(payload?.message || 'Admin session expired', { status: response.status, payload, requestId })
      tokenStore.set(payload?.data?.accessToken)
      return payload
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export const adminRequest = async (endpoint, options = {}, retryState = { hasRetried: false }) => {
  const method = options.method || 'GET'
  const headers = new Headers(options.headers || {})
  const token = tokenStore.get()
  const requestId = headers.get('X-Request-Id') || createRequestId()
  const startedAt = performance.now()

  headers.set('X-Request-Id', requestId)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !isFormData(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    const tokenValue = await getCsrfToken()
    if (tokenValue) headers.set('X-CSRF-Token', tokenValue)
  }

  let response
  try {
    response = await fetchWithTimeout(buildUrl(endpoint), {
      ...options,
      method,
      credentials: 'include',
      headers,
      body: options.body && !isFormData(options.body) ? JSON.stringify(options.body) : options.body,
    })
  } catch (error) {
    recordRequest({ method, endpoint, status: 'NETWORK', duration: Math.round(performance.now() - startedAt), ok: false, requestId })
    const message = error?.name === 'AbortError'
      ? 'Backend request timed out. Check API server, Atlas DNS/network, and CORS settings.'
      : 'Backend is unreachable. Check API server, Atlas DNS/network, and CORS settings.'

    throw new ApiError(message, { requestId })
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null
  const duration = Math.round(performance.now() - startedAt)
  const responseRequestId = response.headers.get('X-Request-Id') || requestId

  recordRequest({ method, endpoint, status: response.status, duration, ok: response.ok, requestId: responseRequestId })

  if (!response.ok) {
    if (response.status === 401 && !retryState.hasRetried && canRefreshForEndpoint(endpoint)) {
      try {
        await refreshAdminSession()
        return adminRequest(endpoint, options, { hasRetried: true })
      } catch {
        tokenStore.clear()
      }
    }

    throw new ApiError(payload?.message || `Request failed with status ${response.status}`, {
      status: response.status,
      payload,
      requestId: responseRequestId,
    })
  }

  return payload
}

export const resolveMediaUrl = url => {
  if (!url) return ''
  if (/^https?:\/\//.test(url) || /^data:/.test(url) || /^blob:/.test(url)) return url
  if (url.startsWith('/uploads')) return apiOrigin ? `${apiOrigin}${url}` : url
  if (url.startsWith('/src/assets')) return `${STOREFRONT_URL}${url}`
  return url
}

const normalizeOrder = order => ({
  ...order,
  id: order.id || order._id || order.mongoId,
  mongoId: order.mongoId || order._id || order.id,
})

export const adminApi = {
  async health() {
    const response = await fetchWithTimeout(apiConfig.healthUrl, { credentials: 'include' })
    return response.json()
  },
  async login(credentials) {
    const payload = await adminRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    tokenStore.set(payload.data?.accessToken)
    return payload.data
  },
  async me() {
    const payload = await adminRequest('/auth/me')
    return payload.data?.user || null
  },
  async logout() {
    await adminRequest('/auth/logout', { method: 'POST' }).catch(() => null)
    tokenStore.clear()
  },
  async dashboard() {
    const payload = await adminRequest('/admin/dashboard')
    return payload.data?.stats || null
  },
  async salesAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString()
    const payload = await adminRequest(`/admin/analytics/sales${query ? `?${query}` : ''}`)
    return payload.data?.analytics || []
  },
  async lowStock() {
    const payload = await adminRequest('/admin/inventory/low-stock')
    return payload.data?.products || []
  },
  async listProducts(params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null)).toString()
    const payload = await adminRequest(`/products${query ? `?${query}` : ''}`)
    return { products: payload.data?.products || [], meta: payload.meta || {} }
  },
  async createProduct(body) {
    const payload = await adminRequest('/products', { method: 'POST', body })
    return payload.data?.product
  },
  async updateProduct(id, body) {
    const payload = await adminRequest(`/products/${id}`, { method: 'PUT', body })
    return payload.data?.product
  },
  async deleteProduct(id) {
    await adminRequest(`/products/${id}`, { method: 'DELETE' })
  },
  async adjustStock(id, body) {
    const payload = await adminRequest(`/products/${id}/stock`, { method: 'PATCH', body })
    return payload.data?.product
  },
  async listCategories() {
    const payload = await adminRequest('/categories')
    return (payload.data?.categories || []).map(category => ({ ...category, id: category.id || category._id }))
  },
  async createCategory(body) {
    const payload = await adminRequest('/categories', { method: 'POST', body })
    return payload.data?.category
  },
  async updateCategory(id, body) {
    const payload = await adminRequest(`/categories/${id}`, { method: 'PUT', body })
    return payload.data?.category
  },
  async deleteCategory(id) {
    await adminRequest(`/categories/${id}`, { method: 'DELETE' })
  },
  async uploadImages(files) {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('images', file))
    const payload = await adminRequest('/uploads/images', { method: 'POST', body: formData })
    return payload.data?.images || []
  },
  async listOrders(params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null)).toString()
    const payload = await adminRequest(`/orders${query ? `?${query}` : ''}`)
    return { orders: (payload.data?.orders || []).map(normalizeOrder), meta: payload.meta || {} }
  },
  async updateOrderStatus(id, body) {
    const payload = await adminRequest(`/orders/${id}/status`, { method: 'PATCH', body })
    return payload.data?.order
  },
  async listUsers(params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null)).toString()
    const payload = await adminRequest(`/admin/users${query ? `?${query}` : ''}`)
    return { users: payload.data?.users || [], meta: payload.meta || {} }
  },
  async updateUser(id, body) {
    const payload = await adminRequest(`/admin/users/${id}`, { method: 'PATCH', body })
    return payload.data?.user
  },
  async listBanners(params = {}) {
    const query = new URLSearchParams(params).toString()
    const payload = await adminRequest(`/banners${query ? `?${query}` : ''}`)
    return payload.data?.banners || []
  },
  async createBanner(body) {
    const payload = await adminRequest('/banners', { method: 'POST', body })
    return payload.data?.banner
  },
  async updateBanner(id, body) {
    const payload = await adminRequest(`/banners/${id}`, { method: 'PUT', body })
    return payload.data?.banner
  },
  async deleteBanner(id) {
    await adminRequest(`/banners/${id}`, { method: 'DELETE' })
  },
  async listCoupons(params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null)).toString()
    const payload = await adminRequest(`/coupons${query ? `?${query}` : ''}`)
    return { coupons: payload.data?.coupons || [], meta: payload.meta || {} }
  },
  async createCoupon(body) {
    const payload = await adminRequest('/coupons', { method: 'POST', body })
    return payload.data?.coupon
  },
  async updateCoupon(id, body) {
    const payload = await adminRequest(`/coupons/${id}`, { method: 'PUT', body })
    return payload.data?.coupon
  },
  async deleteCoupon(id) {
    await adminRequest(`/coupons/${id}`, { method: 'DELETE' })
  },
}
