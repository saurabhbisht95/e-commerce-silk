export const toUserMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback
  if (error.status === 401) return 'Please sign in to continue.'
  if (error.status === 403) return 'You do not have permission to perform this action.'
  if (error.status === 429) return 'Too many requests. Please wait a moment and try again.'
  if (error.status >= 500) return 'Server error. Please try again shortly.'
  return error.message || fallback
}
