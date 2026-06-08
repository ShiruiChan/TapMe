import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalState {
  title: string
  content: ReactNode
}

interface ModalCtx {
  openModal: (title: string, content: ReactNode) => void
  closeModal: () => void
}

const Ctx = createContext<ModalCtx | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)

  const openModal = useCallback((title: string, content: ReactNode) => {
    setModal({ title, content })
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  return (
    <Ctx.Provider value={{ openModal, closeModal }}>
      {children}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                width: '100%', maxWidth: 480,
                background: 'rgba(13,13,38,0.97)',
                backdropFilter: 'blur(24px)',
                border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: '24px 24px 0 0',
                paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '12px auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{modal.title}</div>
                <button
                  onClick={closeModal}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ padding: '16px 20px' }}>{modal.content}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

export function useModal(): ModalCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useModal must be used inside ModalProvider')
  return ctx
}
