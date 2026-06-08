import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import type { TabModule } from '@/tabs/registry'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/store/auth'
import { useMyCard } from '@/api/cards'

interface SidebarProps {
  tabs: TabModule[]
}

export function Sidebar({ tabs }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const { data: card } = useMyCard()

  const activeKey = location.pathname.slice(1) || 'dashboard'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 'var(--sidebar-w)',
        background: 'rgba(7,7,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', marginBottom: 32 }}>
        <div className="logo-ring" style={{ width: 40, height: 40, borderRadius: 12, fontSize: 14 }}>TM</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>TapMe</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Lory.Lab</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tabs.map(tab => {
          const isActive = activeKey === tab.key
          return (
            <motion.button
              key={tab.key}
              onClick={() => navigate(`/${tab.key}`)}
              whileTap={{ scale: 0.97 }}
              className={isActive ? '' : 'sidebar-nav-btn'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                transition: 'background 0.15s, color 0.15s',
                fontFamily: 'inherit',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: 'absolute',
                    left: 12,
                    width: 'calc(var(--sidebar-w) - 24px)',
                    height: 44,
                    background: 'rgba(99,102,241,0.12)',
                    borderRadius: 14,
                    border: '0.5px solid rgba(99,102,241,0.2)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <tab.Icon size={18} strokeWidth={isActive ? 2 : 1.8} />
              <span>{tab.title}</span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }} />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Profile section at bottom */}
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 14, marginBottom: 8 }}>
          <Avatar card={card} size={32} name={profile?.full_name || ''} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name || 'Профиль'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 16px', borderRadius: 12,
            border: 'none', background: 'transparent',
            color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            fontFamily: 'inherit', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </motion.aside>
  )
}
