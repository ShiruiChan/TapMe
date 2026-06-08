import { useState } from 'react'
import { Users } from 'lucide-react'
import type { TabModule, TabContext } from './registry'
import { useTeamMembers } from '@/api/directory'
import type { Card } from '@/lib/database.types'
import { hexRgb, initials, declTeam } from '@/lib/utils'
import { useModal } from '@/components/ui/Modal'
import { downloadVCard } from '@/lib/vcard'
import { trackEvent } from '@/api/events'
import { slugUrl, cardUrl } from '@/lib/b64'
import { useToast } from '@/components/ui/Toast'
import { QRCodeSVG } from 'qrcode.react'

function MemberModal({ card }: { card: Card }) {
  const accent = card.color_hex || '6366f1'
  const rgb = hexRgb(accent)
  const url = card.slug ? slugUrl(card.slug) : cardUrl(card)
  const toast = useToast()
  const { closeModal } = useModal()

  const links = [
    card.telegram && { icon: '✈️', label: 'Telegram', href: `https://t.me/${card.telegram.replace('@','')}` },
    card.instagram && { icon: '📸', label: 'Instagram', href: `https://instagram.com/${card.instagram.replace('@','')}` },
    card.linkedin && { icon: '💼', label: 'LinkedIn', href: card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}` },
    card.github && { icon: '🐙', label: 'GitHub', href: `https://github.com/${card.github}` },
    card.website && { icon: '🌐', label: 'Сайт', href: card.website },
  ].filter(Boolean) as { icon: string; label: string; href: string }[]

  const skills = (card.skills || '').split(',').map(s => s.trim()).filter(Boolean)

  async function copyLink() {
    if (card.id) await trackEvent(card.id, 'share', 'directory')
    closeModal()
    navigator.clipboard?.writeText(url)
      .then(() => toast('Ссылка скопирована!'))
      .catch(() => {})
  }

  async function saveContact() {
    downloadVCard(card)
    if (card.id) await trackEvent(card.id, 'save', 'directory')
  }

  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{
        background: `linear-gradient(135deg,#${accent},rgba(${rgb},.55))`,
        borderRadius: 20, padding: '20px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `rgba(${rgb},.25)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, overflow: 'hidden', flexShrink: 0,
          }}>
            {card.avatar_url ? <img src={card.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : initials(card.name || '')}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{card.name}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{card.role}</div>
            {card.company && <div style={{ fontSize: 11, opacity: 0.45 }}>{card.company}</div>}
          </div>
        </div>
      </div>

      {card.bio && (
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>{card.bio}</p>
      )}

      {skills.length > 0 && (
        <div className="chips-row" style={{ marginBottom: 16 }}>
          {skills.map(s => <span key={s} className="chip">{s}</span>)}
        </div>
      )}

      {card.email && (
        <a href={`mailto:${card.email}`} className="contact-row">
          <div className="c-icon">📧</div>
          <div className="c-text"><div className="c-lbl">Email</div><div className="c-val">{card.email}</div></div>
          <div className="c-arr">›</div>
        </a>
      )}
      {card.phone && (
        <a href={`tel:${card.phone}`} className="contact-row">
          <div className="c-icon">📱</div>
          <div className="c-text"><div className="c-lbl">Телефон</div><div className="c-val">{card.phone}</div></div>
          <div className="c-arr">›</div>
        </a>
      )}

      {links.length > 0 && (
        <div className="link-chips" style={{ marginTop: 12, marginBottom: 16 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="link-chip">
              <span className="lc-icon">{l.icon}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 16, padding: 12, display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <QRCodeSVG value={url} size={140} bgColor="#fff" fgColor="#1a1a2e" level="M" />
      </div>

      <div className="gap-10">
        <button className="btn btn-primary" onClick={copyLink}>🔗&nbsp; Скопировать ссылку</button>
        <button className="btn btn-secondary" onClick={saveContact}>👤&nbsp; Сохранить контакт</button>
      </div>
    </div>
  )
}

function Directory({ ctx: _ctx }: { ctx: TabContext }) {
  const [query, setQuery] = useState('')
  const { data: members, isLoading } = useTeamMembers()
  const { openModal } = useModal()

  const filtered = (members || []).filter(m => {
    if (!query) return true
    const q = query.toLowerCase()
    const c = m.card
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q) ||
      (c.skills || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    )
  })

  function showMember(card: Card) {
    openModal(card.name || 'Профиль', <MemberModal card={card} />)
  }

  return (
    <div>
      <div className="screen-header">
        <div>
          <div className="screen-title">Команда</div>
          <div className="screen-sub">
            {members ? `${members.length} ${declTeam(members.length)} · Lory.Lab` : 'Загрузка...'}
          </div>
        </div>
        {members && <span className="badge">{members.length}</span>}
      </div>

      <div className="search-wrap">
        <span className="search-ico">🔍</span>
        <input
          placeholder="Поиск по имени, должности, навыкам"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="dir-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 18, height: 140 }} className="skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="e-icon">{query ? '🔍' : '🚀'}</div>
          <h3>{query ? 'Никого не нашлось' : 'Пока только ты'}</h3>
          <p>{query ? 'Попробуй другой запрос' : 'Зарегистрируй коллег и они появятся здесь'}</p>
        </div>
      ) : (
        <div className="dir-grid">
          {filtered.map(m => {
            const c = m.card
            const accent = (c.color_hex || '6366f1').replace('#', '')
            const rgb = hexRgb(accent)
            return (
              <div key={c.id} className="dir-card" onClick={() => showMember(c)}>
                <div style={{
                  background: `linear-gradient(135deg,#${accent},rgba(${rgb},.5))`,
                  borderRadius: '50%', padding: 2, display: 'inline-flex',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `rgba(${rgb},.2)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, overflow: 'hidden',
                  }}>
                    {c.avatar_url
                      ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" loading="lazy" />
                      : initials(c.name || m.profile.full_name || '')
                    }
                  </div>
                </div>
                <div className="dir-card-name">{c.name || m.profile.full_name || '—'}</div>
                <div className="dir-card-role">{c.role || m.profile.department || '—'}</div>
                {c.location && <div style={{ fontSize: 11, color: 'var(--muted2)' }}>📍 {c.location}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default {
  key: 'directory',
  title: 'Команда',
  Icon: Users,
  position: 1,
  Component: Directory,
} satisfies TabModule
