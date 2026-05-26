import { createContext, useContext } from 'react'

export const ToastContext = createContext({
  pushToast: () => '',
  dismissToast: () => {},
  success: () => '',
  error: () => '',
  warning: () => '',
  info: () => '',
})

export const useToast = () => useContext(ToastContext)
