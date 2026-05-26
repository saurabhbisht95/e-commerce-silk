import { apiRequest } from './http'

export const addressApi = {
  async list() {
    const payload = await apiRequest('/addresses')
    return payload.data?.addresses || []
  },

  async create(body) {
    const payload = await apiRequest('/addresses', {
      method: 'POST',
      body,
    })
    return payload.data?.address || null
  },

  async update(id, body) {
    const payload = await apiRequest(`/addresses/${id}`, {
      method: 'PUT',
      body,
    })
    return payload.data?.address || null
  },

  async remove(id) {
    await apiRequest(`/addresses/${id}`, {
      method: 'DELETE',
    })
  },

  async setDefault(id) {
    const payload = await apiRequest(`/addresses/${id}/default`, {
      method: 'PATCH',
    })
    return payload.data?.address || null
  },
}
