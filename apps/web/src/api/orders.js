import { apiRequest } from './http'

const createIdempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() || `order-${Date.now()}-${Math.random().toString(36).slice(2)}`

export const orderApi = {
  async create(body) {
    const idempotencyKey = body.idempotencyKey || createIdempotencyKey()
    const payload = await apiRequest('/orders', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: {
        ...body,
        idempotencyKey,
      },
    })
    return payload.data?.order || null
  },

  async myOrders() {
    const payload = await apiRequest('/orders/me')
    return payload.data?.orders || []
  },

  async cancel(orderId, reason) {
    const payload = await apiRequest(`/orders/me/${orderId}/cancel`, {
      method: 'POST',
      body: { reason },
    })
    return payload.data?.order || null
  },

  async requestReturn(orderId, reason) {
    const payload = await apiRequest(`/orders/me/${orderId}/return`, {
      method: 'POST',
      body: { reason },
    })
    return payload.data?.order || null
  },

  async reorder(orderId) {
    const payload = await apiRequest(`/orders/me/${orderId}/reorder`, {
      method: 'POST',
    })
    return payload.data?.cart || null
  },
}
