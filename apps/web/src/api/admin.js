import { apiRequest } from './http'
import { bannerApi } from './banners'

export const adminApi = {
  async dashboard() {
    const payload = await apiRequest('/admin/dashboard')
    return payload.data?.stats || null
  },

  async listProducts(params = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') searchParams.set(key, value)
    })
    const query = searchParams.toString()
    const payload = await apiRequest(`/products${query ? `?${query}` : ''}`)
    return {
      products: payload.data?.products || [],
      meta: payload.meta || {},
    }
  },

  async listCategories() {
    const payload = await apiRequest('/categories')
    return (payload.data?.categories || []).map(category => ({
      ...category,
      id: category.id || category._id,
    }))
  },

  async createCategory(body) {
    const payload = await apiRequest('/categories', {
      method: 'POST',
      body,
    })
    return payload.data?.category || null
  },

  async createProduct(body) {
    const payload = await apiRequest('/products', {
      method: 'POST',
      body,
    })
    return payload.data?.product || null
  },

  async updateProduct(id, body) {
    const payload = await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body,
    })
    return payload.data?.product || null
  },

  async deleteProduct(id) {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    })
  },

  async uploadImages(files) {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('images', file))
    const payload = await apiRequest('/uploads/images', {
      method: 'POST',
      body: formData,
    })
    return payload.data?.images || []
  },

  async listBanners() {
    return bannerApi.list({ includeInactive: true })
  },

  async createBanner(body) {
    const payload = await apiRequest('/banners', {
      method: 'POST',
      body,
    })
    return payload.data?.banner || null
  },

  async updateBanner(id, body) {
    const payload = await apiRequest(`/banners/${id}`, {
      method: 'PUT',
      body,
    })
    return payload.data?.banner || null
  },

  async deleteBanner(id) {
    await apiRequest(`/banners/${id}`, {
      method: 'DELETE',
    })
  },

  async listOrders(params = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') searchParams.set(key, value)
    })
    const query = searchParams.toString()
    const payload = await apiRequest(`/orders${query ? `?${query}` : ''}`)
    return {
      orders: payload.data?.orders || [],
      meta: payload.meta || {},
    }
  },

  async updateOrderStatus(id, body) {
    const payload = await apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body,
    })
    return payload.data?.order || null
  },
}
