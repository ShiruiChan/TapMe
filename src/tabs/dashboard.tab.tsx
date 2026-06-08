import { useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import type { TabModule, TabContext } from './registry'
import { Avatar } from '@/components/ui/Avatar'
import { useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useRecentEvents } from '@/api/events'
import { slugUrl, cardUrl } from '@/lib/b64'
import { trackEvent } from '@/api/events'
import { hexRgb, fmtDate, declTeam } from '@/lib/utils'
import QRModal from '@/features/editor/QRModal'

function Dashboard({ ctx }: { ctx: TabContext }) {
  const { card, profile, stats } = ctx
  const navigate = useNavigate()
  const { openModal } = useModal()
  const toast = useToast()
  const { data: events } = useRecentEvents(card?.id)

  const accent = card?.color_hex || '6366f1'
  const rgb = hexRgb(accent)
  const firstName = (profile?.full_name || '').split(' ')[0] || 'Привет'
  const url = card?.slug ? slugUrl(card.slug) : card ? cardUrl(card) : ''

  function showQR() {
    if (!card) return toast('Сначала заполни карточку')
    openModal('Моя карточка', <QRModal card={card} />)
  }

  async function share() {
    if (!card) return toast('Сначала заполни карточку')
    if (card.id) await trackEvent(card.id, 'share', 'link')
    if (navigator.share) {
      navigator.share({ title: card.name || 'TapMe', text: card.role || '', url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
        .then(() => toast('Ссылка скопирована!'))
        .catch(() => toast(url))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, paddingBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Привет, {firstName} 👋</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            {profile?.department ? profile.department + ' · ' : ''}Lory.Lab
          </div>
        </div>
        <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <Avatar card={card} size={40} name={profile?.full_name || ''} />
        </div>
      </div>

      {/* Mini card */}
      <div
        className="mini-card"
        style={{
          background: `linear-gradient(135deg,#${accent},rgba(${rgb},.55))`,
          marginBottom: 20,
        }}
        onClick={showQR}
      >
        <div className="mini-card-orb" style={{ width: 160, height: 160, top: -50, right: -40 }} />
        <div className="mini-card-orb" style={{ width: 100, height: 100, bottom: -30, left: -25 }} />
        <div className="mini-card-top">
          <Avatar card={card} size={42} name={profile?.full_name || ''} />
          <div style={{
            background: 'rgba(255,255,255,.15)',
            borderRadius: 8, padding: '5px 10px',
            fontSize: 11, fontWeight: 600,
          }}>
            Показать QR
          </div>
        </div>
        <div className="mini-card-name">{card?.name || profile?.full_name || 'Моя карточка'}</div>
        <div className="mini-card-role">{card?.role || 'Нажми чтобы показать QR'}</div>
        {card?.company && <div className="mini-card-company">{card.company}</div>}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{stats?.views ?? 0}</div>
          <div className="stat-lbl">Просмотров</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats?.saves ?? 0}</div>
          <div className="stat-lbl">Сохранений</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats?.shares ?? 0}</div>
          <div className="stat-lbl">Поделились</div>
        </div>
      </div>

      {/* Actions */}
      <div className="action-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: '✏️', label: 'Редактировать', sub: 'Изменить данные', action: () => navigate('/editor') },
          { icon: '🔗', label: 'Поделиться', sub: 'Скопировать ссылку', action: share },
          { icon: '📱', label: 'QR-код', sub: 'Показать код', action: showQR },
          { icon: '👥', label: 'Команда', sub: `Все коллеги`, action: () => navigate('/directory') },
        ].map(a => (
          <button key={a.label} className="action-card glass-card" onClick={a.action}>
            <div className="action-icon">{a.icon}</div>
            <div className="action-label">{a.label}</div>
            <div className="action-sub">{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Recent events */}
      {events && events.length > 0 && (
        <div className="glass-card">
          <div className="card-label">Последние события</div>
          {events.slice(0, 5).map(ev => (
            <div key={ev.id} className="scan-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {ev.type === 'view' ? 'Просмотр карточки' : ev.type === 'save' ? 'Контакт сохранён' : 'Ссылка скопирована'}
                </div>
                <div className="scan-row-time">{fmtDate(ev.created_at)}</div>
              </div>
              <span className={`tag tag-${ev.type}`}>
                {ev.type === 'view' ? 'просмотр' : ev.type === 'save' ? 'сохранение' : 'поделились'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  )
}

export default {
  key: 'dashboard',
  title: 'Карточка',
  Icon: LayoutGrid,
  position: 0,
  requiresCard: false,
  Component: Dashboard,
} satisfies TabModule
