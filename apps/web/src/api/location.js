import { apiRequest } from './http'

export const locationApi = {
  async reverseGeocode({ latitude, longitude }) {
    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
    })
    const payload = await apiRequest(`/location/reverse?${params}`)
    return payload.data?.address || null
  },
}
