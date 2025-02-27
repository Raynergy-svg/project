import { useState, useEffect } from 'react'
import { toast as uiToast } from '@/components/ui/use-toast'

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

type ToastState = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
}

const useToast = (): ToastState => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2)
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)
        return () => clearTimeout(timer)
      }
    })
  }, [toasts])

  return { toasts, addToast, removeToast }
}

// Export the toast function from the UI component for compatibility
export const toast = uiToast

export { useToast }
export type { ToastProps }
