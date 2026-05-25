const GUEST_ID_KEY = 'doon_silk_guest_id'

export const getGuestId = () => {
  const existing = localStorage.getItem(GUEST_ID_KEY)
  if (existing) return existing

  const guestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`

  localStorage.setItem(GUEST_ID_KEY, guestId)
  return guestId
}
