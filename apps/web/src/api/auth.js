import { getGuestId } from './guest'
import { apiRequest } from './http'

export const authApi = {
  async me() {
    const payload = await apiRequest('/auth/me')
    return payload.data?.user || null
  },

  async login(credentials) {
    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    return payload.data || null
  },

  async register(details) {
    const payload = await apiRequest('/auth/register', {
      method: 'POST',
      body: details,
    })
    return payload.data || null
  },

  async logout() {
    await apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  async changePassword(body) {
    const payload = await apiRequest('/auth/change-password', {
      method: 'PATCH',
      body,
    })
    return payload.data || null
  },

  async forgotPassword(email) {
    const payload = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
    return payload.data || null
  },

  async mergeGuestCart() {
    const payload = await apiRequest('/cart/merge', {
      method: 'POST',
      body: { guestId: getGuestId() },
    })
    return payload.data?.cart || null
  },
}
