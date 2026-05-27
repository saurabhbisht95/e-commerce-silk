import { apiRequest, resolveApiAssetUrl } from './http'

const normalizeBanner = banner => ({
  ...banner,
  id: banner.id || banner._id,
  headline: Array.isArray(banner.headline) && banner.headline.length ? banner.headline : ['Doon Silk'],
  modelImage: resolveApiAssetUrl(banner.modelImage || banner.modelImageData?.url || ''),
  sideImage: resolveApiAssetUrl(banner.sideImage || banner.sideImageData?.url || banner.modelImage || banner.modelImageData?.url || ''),
})

export const bannerApi = {
  async list(params = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') searchParams.set(key, value)
    })
    const query = searchParams.toString()
    const payload = await apiRequest(`/banners${query ? `?${query}` : ''}`)
    return (payload.data?.banners || []).map(normalizeBanner)
  },
}
