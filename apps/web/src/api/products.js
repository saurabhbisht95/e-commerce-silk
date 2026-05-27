import { PRODUCTS as STATIC_PRODUCTS } from '../data/products'
import { apiRequest, resolveApiAssetUrl } from './http'

const fallbackById = new Map(STATIC_PRODUCTS.map(product => [String(product.id), product]))

const isExternalAsset = url => /^https?:\/\//.test(url || '') || /^data:/.test(url || '') || /^blob:/.test(url || '')
const isApiUploadAsset = url => String(url || '').startsWith('/uploads')

export const getBackendProductId = product => {
  const id = product?.mongoId || product?._id || product?.backendId
  if (id) return id
  return /^[a-f\d]{24}$/i.test(String(product?.id || '')) ? String(product.id) : null
}

export const normalizeProduct = product => {
  const fallback = fallbackById.get(String(product.id || product.legacyId || ''))
  const image = isExternalAsset(product.image) || isApiUploadAsset(product.image)
    ? resolveApiAssetUrl(product.image)
    : fallback?.image || product.image
  const imageLarge = isExternalAsset(product.imageLarge) || isApiUploadAsset(product.imageLarge)
    ? resolveApiAssetUrl(product.imageLarge)
    : fallback?.imageLarge || fallback?.image || product.imageLarge || image

  return {
    ...product,
    backendId: getBackendProductId(product),
    id: product.id || product.legacyId || product.mongoId || product._id,
    category: product.category?.name || product.category || fallback?.category || '',
    price: product.price || product.displayPrice || fallback?.price || '',
    image,
    imageLarge,
  }
}

export const normalizeProducts = products => products.map(normalizeProduct)

export const productApi = {
  async list(params = {}) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') searchParams.set(key, value)
    })

    const query = searchParams.toString()
    const payload = await apiRequest(`/products${query ? `?${query}` : ''}`)
    return {
      products: normalizeProducts(payload.data?.products || []),
      meta: payload.meta || {},
    }
  },

  async featured(limit = 10) {
    const payload = await apiRequest(`/products/featured?limit=${limit}`)
    return normalizeProducts(payload.data?.products || [])
  },

  async trending(limit = 10) {
    const payload = await apiRequest(`/products/trending?limit=${limit}`)
    return normalizeProducts(payload.data?.products || [])
  },
}
