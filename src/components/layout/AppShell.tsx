import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { TAB_REGISTRY } from '@/tabs/registry'
import { Sidebar } from './Sidebar'
import { MobileDock } from './MobileDock'
import { useMyCard } from '@/api/cards'
import { useModal } from '@/components/ui/Modal'
import { slugUrl, cardUrl } from '@/lib/b64'
import { trackEvent } from '@/api/events'
import { useToast } from '@/components/ui/Toast'
import QRModal from '@/features/editor/QRModal'
import { MigrationBanner } from '@/components/MigrationBanner'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export function AppShell() {
  const isDesktop = useIsDesktop()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: card } = useMyCard()
  const { openModal } = useModal()
  const toast = useToast()

  const tabs = TAB_REGISTRY.filter(t => {
    if (t.scope === 'mobile' && isDesktop) return false
    if (t.scope === 'desktop' && !isDesktop) return false
    return true
  })

  function handleQr() {
    if (!card) return toast('Сначала заполни карточку')
    openModal('Моя карточка', <QRModal card={card} />)
  }

  async function handleShare() {
    if (!card) return toast('Сначала заполни карточку')
    const url = card.slug ? slugUrl(card.slug) : cardUrl(card)
    if (card.id) await trackEvent(card.id, 'share', 'link')
    if (navigator.share) {
      navigator.share({ title: card.name || 'TapMe', text: card.role || '', url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
        .then(() => toast('Ссылка скопирована!'))
        .catch(() => toast(url))
    }
  }

  function handleEdit() {
    navigate('/editor')
  }

  return (
    <>
      <MigrationBanner />
      {isDesktop ? (
        <Sidebar tabs={tabs} />
      ) : (
        <MobileDock
          tabs={tabs}
          onQr={handleQr}
          onShare={handleShare}
          onEdit={handleEdit}
        />
      )}

      <div className={isDesktop ? '' : 'main-content'} style={isDesktop ? { paddingLeft: 'var(--sidebar-w)' } : undefined}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={isDesktop ? { maxWidth: 860, margin: '0 auto', padding: '32px 40px' } : undefined}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
