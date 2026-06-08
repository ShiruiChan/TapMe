import { QRCodeSVG } from 'qrcode.react'
import type { Card } from '@/lib/database.types'
import { slugUrl, cardUrl } from '@/lib/b64'
import { trackEvent } from '@/api/events'
import { downloadVCard } from '@/lib/vcard'
import { useToast } from '@/components/ui/Toast'
import { useModal } from '@/components/ui/Modal'
import { hexRgb } from '@/lib/utils'

export default function QRModal({ card }: { card: Card }) {
  const toast = useToast()
  const { closeModal } = useModal()
  const url = card.slug ? slugUrl(card.slug) : cardUrl(card)
  const accent = card.color_hex || '6366f1'
  const rgb = hexRgb(accent)

  async function share() {
    if (card.id) await trackEvent(card.id, 'share', 'link')
    closeModal()
    if (navigator.share) {
      navigator.share({ title: card.name || 'TapMe', text: card.role || '', url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
        .then(() => toast('Ссылка скопирована!'))
        .catch(() => toast(url))
    }
  }

  function openCard() {
    window.open(url, '_blank')
  }

  async function dlVCard() {
    downloadVCard(card)
    if (card.id) await trackEvent(card.id, 'save', 'direct')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBottom: 8 }}>
      <div style={{
        background: `linear-gradient(135deg,#${accent},rgba(${rgb},.6))`,
        borderRadius: 16, padding: '16px 20px', width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{card.name}</div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>{card.role || card.company}</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 14, display: 'inline-block' }}>
        <QRCodeSVG value={url} size={180} bgColor="#ffffff" fgColor="#1a1a2e" level="M" />
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
        Отсканируй камерой чтобы открыть карточку
      </div>

      <div className="gap-10" style={{ width: '100%' }}>
        <button
          className="btn btn-primary"
          style={{ background: `linear-gradient(135deg,#${accent},#06b6d4)` }}
          onClick={share}
        >
          🔗&nbsp; Скопировать ссылку
        </button>
        <button className="btn btn-secondary" onClick={openCard}>👁&nbsp; Открыть карточку</button>
        <button className="btn btn-secondary" onClick={dlVCard}>👤&nbsp; Скачать .vcf контакт</button>
      </div>
    </div>
  )
}
