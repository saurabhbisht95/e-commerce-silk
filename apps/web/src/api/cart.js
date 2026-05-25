import { getGuestId } from './guest'
import { apiRequest } from './http'

const guestHeaders = () => ({
  'x-guest-id': getGuestId(),
})

export const cartApi = {
  async get() {
    const payload = await apiRequest('/cart', {
      headers: guestHeaders(),
    })
    return payload.data?.cart || null
  },

  async addItem({ productId, variantSku, quantity = 1 }) {
    const payload = await apiRequest('/cart/items', {
      method: 'POST',
      headers: guestHeaders(),
      body: {
        productId,
        variantSku,
        quantity,
      },
    })
    return payload.data?.cart || null
  },

  async updateItem({ productId, variantSku, quantity }) {
    const payload = await apiRequest('/cart/items', {
      method: 'PATCH',
      headers: guestHeaders(),
      body: {
        productId,
        variantSku,
        quantity,
      },
    })
    return payload.data?.cart || null
  },

  async removeItem({ productId, variantSku }) {
    const payload = await apiRequest('/cart/items', {
      method: 'DELETE',
      headers: guestHeaders(),
      body: {
        productId,
        variantSku,
      },
    })
    return payload.data?.cart || null
  },

  async mergeGuest(guestId) {
    const payload = await apiRequest('/cart/merge', {
      method: 'POST',
      body: { guestId },
    })
    return payload.data?.cart || null
  },
}
