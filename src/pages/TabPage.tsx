import { useParams, useLocation } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { TAB_REGISTRY } from '@/tabs/registry'
import { useMyCard } from '@/api/cards'
import { useAuth } from '@/store/auth'
import { useCardStats } from '@/api/events'

export default function TabPage() {
  const { tabKey } = useParams<{ tabKey: string }>()
  const location = useLocation()
  const routeKey = tabKey || location.pathname.slice(1) || 'dashboard'
  const { data: card } = useMyCard()
  const { profile } = useAuth()
  const { data: stats } = useCardStats(card?.id)

  const tab = TAB_REGISTRY.find(t => t.key === routeKey)
  if (!tab) {
    return (
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div style={{ color: 'var(--muted2)', marginBottom: 16 }}><SearchX size={48} strokeWidth={1.5} /></div>
        <h3>Вкладка не найдена</h3>
      </div>
    )
  }

  const ctx = { card: card ?? null, profile: profile ?? null, stats: stats ?? null }
  return <tab.Component ctx={ctx} />
}
