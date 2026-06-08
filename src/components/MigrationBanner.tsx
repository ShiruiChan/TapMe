import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLegacyMigration } from '@/hooks/useLegacyMigration'
import { useToast } from '@/components/ui/Toast'

export function MigrationBanner() {
  const { hasMigration, migrate, dismiss } = useLegacyMigration()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function handleMigrate() {
    setLoading(true)
    try {
      await migrate()
      toast('Данные успешно перенесены!')
    } catch {
      toast('Ошибка миграции, попробуй ещё раз')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {hasMigration && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'rgba(13,13,38,0.95)',
            backdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(99,102,241,0.3)',
            borderRadius: 18,
            padding: '14px 18px',
            maxWidth: 380,
            width: 'calc(100% - 32px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            📦 Найдены данные старой версии
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
            Перенести карточку из предыдущей версии TapMe?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleMigrate}
              disabled={loading}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10, border: 'none',
                background: 'var(--grad)', color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Переносим...' : 'Перенести'}
            </button>
            <button
              onClick={dismiss}
              style={{
                padding: '8px 12px', borderRadius: 10,
                border: '0.5px solid var(--border2)',
                background: 'transparent', color: 'var(--muted)',
                fontSize: 12, cursor: 'pointer',
              }}
            >
              Пропустить
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
