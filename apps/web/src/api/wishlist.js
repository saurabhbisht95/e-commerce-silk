import { apiRequest } from './http'

export const wishlistApi = {
  async get() {
    const payload = await apiRequest('/wishlist')
    return payload.data?.wishlist || null
  },

  async add(productId) {
    const payload = await apiRequest(`/wishlist/${productId}`, {
      method: 'POST',
    })
    return payload.data?.wishlist || null
  },

  async remove(productId) {
    const payload = await apiRequest(`/wishlist/${productId}`, {
      method: 'DELETE',
    })
    return payload.data?.wishlist || null
  },
}
