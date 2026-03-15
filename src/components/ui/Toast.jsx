/**
 * Toast notification system for InternX.
 * Usage:
 *   import { ToastProvider, useToast } from './ui/Toast'
 *   Wrap app in <ToastProvider>, then call:
 *     const { showToast } = useToast()
 *     showToast('Saved!', 'success')          // types: success | error | warning | info
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

const COLORS = {
  success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  error:   { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D' },
  warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#78350F' },
  info:    { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A5F' },
}

function Toast({ id, message, type, onClose }) {
  const colors = COLORS[type] || COLORS.info

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3500)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: colors.bg,
        border: `1.5px solid ${colors.border}`,
        color: colors.text,
        borderRadius: '10px',
        padding: '12px 16px',
        minWidth: '260px',
        maxWidth: '380px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => onClose(id)}
      role="alert"
      aria-live="assertive"
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{ICONS[type]}</span>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
        {message}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(id) }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6, padding: '0 2px', color: 'inherit' }}
        aria-label="Close notification"
      >
        ×
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — fixed at top-right */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <Toast {...t} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
