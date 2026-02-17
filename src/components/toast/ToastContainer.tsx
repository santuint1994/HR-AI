import { createContext, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import Toast from './Toast'

type Toast = {
  id: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

type ToastContextType = {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, duration }])

    // Auto-remove after duration (optional, since Toast has its own timer)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration + 600) // extra buffer for exit animation
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}