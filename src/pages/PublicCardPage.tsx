import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { getCardBySlug } from '@/api/cards'
import { fromB64 } from '@/lib/b64'
import type { Card } from '@/lib/database.types'
import PublicCardView from '@/features/public-card/PublicCardView'
import { Orbs } from '@/components/Orbs'

export default function PublicCardPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Legacy: ?d= base64 encoded card (backwards compatibility)
      const encoded = searchParams.get('d')
      if (encoded) {
        try {
          const decoded = fromB64(encoded) as Record<string, unknown>
          const legacyCard: Partial<Card> = {
            name: decoded.name as string,
            role: decoded.role as string,
            company: decoded.company as string,
            tagline: decoded.tagline as string,
            bio: decoded.bio as string,
            location: decoded.location as string,
            skills: decoded.skills as string,
            email: decoded.email as string,
            phone: decoded.phone as string,
            website: decoded.website as string,
            telegram: decoded.telegram as string,
            vk: decoded.vk as string,
            instagram: decoded.instagram as string,
            linkedin: decoded.linkedin as string,
            github: decoded.github as string,
            behance: decoded.behance as string,
            color_hex: (decoded.colorHex as string) || '6366f1',
            avatar_url: decoded.avatar as string,
            slug: decoded.slug as string,
            is_public: true,
            id: undefined,
            user_id: '',
            updated_at: new Date().toISOString(),
          }
          setCard(legacyCard as Card)
        } catch { /* show empty */ }
        setLoading(false)
        return
      }

      // New: /c/:slug
      if (slug) {
        const data = await getCardBySlug(slug).catch(() => null)
        setCard(data)
      }
      setLoading(false)
    }
    load()
  }, [slug, searchParams])

  return (
    <>
      <Orbs />
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--muted)' }}>
          Загрузка...
        </div>
      ) : card ? (
        <PublicCardView card={card} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ color: 'var(--muted2)', marginBottom: 16 }}><SearchX size={56} strokeWidth={1.5} /></div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Карточка не найдена</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Возможно, ссылка устарела или карточка была скрыта</p>
        </div>
      )}
    </>
  )
}
