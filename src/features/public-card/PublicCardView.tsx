import { useEffect } from 'react'
import type { Card } from '@/lib/database.types'
import { trackEvent } from '@/api/events'
import { downloadVCard } from '@/lib/vcard'
import { hexRgb, initials } from '@/lib/utils'
import { slugUrl } from '@/lib/b64'
import { useToast } from '@/components/ui/Toast'

const SOCIAL_LINKS: { key: keyof Card; icon: string; label: string; baseUrl?: string }[] = [
  { key: 'telegram', icon: '✈️', label: 'Telegram', baseUrl: 'https://t.me/' },
  { key: 'instagram', icon: '📸', label: 'Instagram', baseUrl: 'https://instagram.com/' },
  { key: 'vk', icon: '💙', label: 'ВКонтакте', baseUrl: 'https://vk.com/' },
  { key: 'linkedin', icon: '💼', label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
  { key: 'github', icon: '🐙', label: 'GitHub', baseUrl: 'https://github.com/' },
  { key: 'behance', icon: '🎨', label: 'Behance', baseUrl: 'https://behance.net/' },
  { key: 'website', icon: '🌐', label: 'Сайт' },
]

export default function PublicCardView({ card }: { card: Card }) {
  const accent = card.color_hex || '6366f1'
  const rgb = hexRgb(accent)
  const toast = useToast()

  useEffect(() => {
    if (card.id) {
      const source = new URLSearchParams(location.search).has('qr') ? 'qr' : 'link'
      trackEvent(card.id, 'view', source as 'qr' | 'link')
    }
  }, [card.id])

  const skills = (card.skills || '').split(',').map(s => s.trim()).filter(Boolean)

  const socialLinks = SOCIAL_LINKS
    .filter(s => card[s.key])
    .map(s => {
      const val = card[s.key] as string
      const href = s.baseUrl
        ? s.baseUrl + val.replace(/^@/, '').replace(/^https?:\/\/[^/]+\//, '')
        : val.startsWith('http') ? val : `https://${val}`
      return { ...s, href }
    })

  async function saveContact() {
    downloadVCard(card)
    if (card.id) await trackEvent(card.id, 'save', 'direct')
    toast('Контакт сохранён!')
  }

  async function share() {
    const url = card.slug ? slugUrl(card.slug) : location.href
    if (card.id) await trackEvent(card.id, 'share', 'link')
    if (navigator.share) {
      navigator.share({ title: card.name || 'TapMe', url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
        .then(() => toast('Ссылка скопирована!'))
        .catch(() => {})
    }
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: '0 20px 48px', position: 'relative', zIndex: 1 }}>
      {/* Hero card */}
      <div className="pub-hero" style={{ background: `linear-gradient(135deg,#${accent},rgba(${rgb},.55))` }}>
        <div className="pub-hero-orb1" />
        <div className="pub-hero-orb2" />
        <div className="pub-hero-top">
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `rgba(255,255,255,0.15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, overflow: 'hidden',
          }}>
            {card.avatar_url
              ? <img src={card.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={card.name || ''} />
              : initials(card.name || '')
            }
          </div>
          <div style={{ opacity: 0.4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M20.25 5.25H15.75C15.3358 5.25 15 5.5858 15 6C15 6.4142 15.3358 6.75 15.75 6.75H18.4395L13.2195 11.9698C12.9266 12.2626 12.9266 12.7374 13.2195 13.0302C13.5124 13.3231 13.9871 13.3231 14.2799 13.0302L19.5 7.8103V10.5C19.5 10.9142 19.8358 11.25 20.25 11.25C20.6642 11.25 21 10.9142 21 10.5V6C21 5.5858 20.6642 5.25 20.25 5.25Z" />
              <path d="M10.5 7.5H5.25C4.42157 7.5 3.75 8.17157 3.75 9V18.75C3.75 19.5784 4.42157 20.25 5.25 20.25H15C15.8284 20.25 16.5 19.5784 16.5 18.75V13.5C16.5 13.0858 16.1642 12.75 15.75 12.75C15.3358 12.75 15 13.0858 15 13.5V18.75H5.25V9H10.5C10.9142 9 11.25 8.6642 11.25 8.25C11.25 7.8358 10.9142 7.5 10.5 7.5Z" />
            </svg>
          </div>
        </div>
        <div className="pub-name">{card.name}</div>
        {card.role && <div className="pub-role">{card.role}</div>}
        {card.company && <div className="pub-company">{card.company}</div>}
        {card.tagline && <div className="pub-tagline">"{card.tagline}"</div>}
        {card.location && (
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>📍 {card.location}</div>
        )}
      </div>

      {/* Bio */}
      {card.bio && (
        <div className="glass-card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{card.bio}</p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 12 }}>
          <div className="card-label">Навыки</div>
          <div className="chips-row">
            {skills.map(s => <span key={s} className="chip">{s}</span>)}
          </div>
        </div>
      )}

      {/* Contacts */}
      {(card.email || card.phone) && (
        <div className="glass-card" style={{ marginBottom: 12 }}>
          <div className="card-label">Контакты</div>
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
        </div>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="link-chips" style={{ marginBottom: 20 }}>
          {socialLinks.map(l => (
            <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className="link-chip">
              <span className="lc-icon">{l.icon}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* CTA buttons */}
      <div className="gap-10">
        <button
          className="btn btn-primary"
          style={{ background: `linear-gradient(135deg,#${accent},#06b6d4)` }}
          onClick={saveContact}
        >
          👤&nbsp; Сохранить контакт
        </button>
        <button className="btn btn-secondary" onClick={share}>
          🔗&nbsp; Поделиться
        </button>
      </div>

      <div className="pub-footer">
        Создано в <strong>TapMe</strong> · Lory.Lab
      </div>
    </div>
  )
}
