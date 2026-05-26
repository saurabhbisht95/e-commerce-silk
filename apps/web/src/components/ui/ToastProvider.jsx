import { useCallback, useEffect, useMemo, useState } from 'react'
import { ToastContext } from '../../context/toastContext'
import './ToastProvider.css'

const DEFAULT_DURATION = 4200

const icons = {
  success: 'OK',
  error: '!',
  warning: '!',
  info: 'i',
}

const normalizeToast = toast => ({
  id: toast.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type: toast.type || 'info',
  title: toast.title || '',
  message: toast.message || '',
  duration: toast.duration ?? DEFAULT_DURATION,
})

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback(id => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const pushToast = useCallback(toast => {
    const nextToast = normalizeToast(toast)
    setToasts(current => [nextToast, ...current].slice(0, 5))
    return nextToast.id
  }, [])

  const createTypedToast = useCallback(
    type => (message, title = '') => pushToast({ type, title, message }),
    [pushToast]
  )

  useEffect(() => {
    const onExternalToast = event => {
      if (event.detail) pushToast(event.detail)
    }

    window.addEventListener('doon-silk:toast', onExternalToast)
    return () => window.removeEventListener('doon-silk:toast', onExternalToast)
  }, [pushToast])

  useEffect(() => {
    const timers = toasts
      .filter(toast => toast.duration > 0)
      .map(toast => window.setTimeout(() => dismissToast(toast.id), toast.duration))

    return () => timers.forEach(window.clearTimeout)
  }, [dismissToast, toasts])

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
      success: createTypedToast('success'),
      error: createTypedToast('error'),
      warning: createTypedToast('warning'),
      info: createTypedToast('info'),
    }),
    [createTypedToast, dismissToast, pushToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <div className={`toast toast--${toast.type}`} key={toast.id}>
            <span className="toast__icon" aria-hidden="true">{icons[toast.type] || icons.info}</span>
            <span className="toast__content">
              {toast.title && <strong>{toast.title}</strong>}
              <span>{toast.message}</span>
            </span>
            <button className="toast__close" type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss message">
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
