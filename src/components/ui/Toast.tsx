import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ToastMsg { id: number; text: string }

interface ToastCtx {
  toast: (text: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msgs, setMsgs] = useState<ToastMsg[]>([])

  const toast = useCallback((text: string) => {
    const id = Date.now()
    setMsgs(prev => [...prev, { id, text }])
    setTimeout(() => setMsgs(prev => prev.filter(m => m.id !== id)), 2500)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 100, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 9999, pointerEvents: 'none' }}>
        <AnimatePresence>
          {msgs.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              style={{
                background: 'rgba(30,30,60,0.92)',
                backdropFilter: 'blur(16px)',
                border: '0.5px solid rgba(255,255,255,0.12)',
                color: 'var(--text)',
                fontSize: 13.5,
                fontWeight: 500,
                padding: '10px 22px',
                borderRadius: 100,
                whiteSpace: 'nowrap',
              }}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): (text: string) => void {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.toast
}
