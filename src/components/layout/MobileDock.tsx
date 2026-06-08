import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Share2, Pencil } from 'lucide-react'
import type { TabModule } from '@/tabs/registry'

interface MobileDockProps {
  tabs: TabModule[]
  onQr?: () => void
  onShare?: () => void
  onEdit?: () => void
}

export function MobileDock({ tabs, onQr, onShare, onEdit }: MobileDockProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [fabOpen, setFabOpen] = useState(false)

  const activeKey = location.pathname.slice(1) || 'dashboard'

  const fabActions = [
    { icon: QrCode, label: 'QR-код', action: onQr, color: '#6366f1' },
    { icon: Share2, label: 'Поделиться', action: onShare, color: '#06b6d4' },
    { icon: Pencil, label: 'Редактировать', action: onEdit, color: '#10b981' },
  ]

  const leftTabs = tabs.slice(0, Math.floor(tabs.length / 2))
  const rightTabs = tabs.slice(Math.ceil(tabs.length / 2))

  return (
    <>
      {/* Blur backdrop when FAB open */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* FAB radial actions */}
      <AnimatePresence>
        {fabOpen && fabActions.map((action, i) => {
          const angles = [-90, -30, -150]
          const angle = angles[i]
          const rad = (angle * Math.PI) / 180
          const dist = 80
          const x = Math.cos(rad) * dist
          const y = Math.sin(rad) * dist

          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: 1, x, y, scale: 1 }}
              exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: i * 0.04 }}
              onClick={() => {
                setFabOpen(false)
                action.action?.()
              }}
              style={{
                position: 'fixed',
                bottom: 'calc(var(--nav-h) - 4px + var(--safe-b))',
                left: '50%',
                marginLeft: -28,
                zIndex: 101,
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: 'none',
                background: action.color,
                boxShadow: `0 4px 20px ${action.color}66`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <action.icon size={20} />
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.2 }}>{action.label}</span>
            </motion.button>
          )
        })}
      </AnimatePresence>

      {/* Floating Pill Dock */}
      <div
        style={{
          position: 'fixed',
          bottom: `calc(16px + var(--safe-b))`,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(7,7,26,0.9)',
          backdropFilter: 'blur(24px)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 100,
          padding: '8px 8px',
          gap: 4,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Left tabs */}
        {leftTabs.map(tab => (
          <DockItem
            key={tab.key}
            tab={tab}
            isActive={activeKey === tab.key}
            onClick={() => navigate(`/${tab.key}`)}
          />
        ))}

        {/* Central FAB */}
        <motion.button
          onClick={() => setFabOpen(v => !v)}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: fabOpen ? 45 : 0 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 4px',
            flexShrink: 0,
          }}
        >
          <motion.svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </motion.svg>
        </motion.button>

        {/* Right tabs */}
        {rightTabs.map(tab => (
          <DockItem
            key={tab.key}
            tab={tab}
            isActive={activeKey === tab.key}
            onClick={() => navigate(`/${tab.key}`)}
          />
        ))}
      </div>
    </>
  )
}

interface DockItemProps {
  tab: TabModule
  isActive: boolean
  onClick: () => void
}

function DockItem({ tab, isActive, onClick }: DockItemProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: isActive ? 'var(--accent)' : 'var(--muted)',
        transition: 'color 0.2s, background 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ scale: isActive ? 1.15 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <tab.Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
      </motion.div>

      {isActive && (
        <motion.div
          layoutId="dock-active-dot"
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--accent)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </motion.button>
  )
}
