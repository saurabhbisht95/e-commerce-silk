import { createContext, useContext } from 'react'

export const CommerceContext = createContext(null)

export const useCommerce = () => {
  const context = useContext(CommerceContext)
  if (!context) throw new Error('useCommerce must be used inside CommerceProvider')
  return context
}
