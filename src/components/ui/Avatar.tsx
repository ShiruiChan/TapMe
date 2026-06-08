import { initials, hexRgb } from '@/lib/utils'
import type { Card } from '@/lib/database.types'

interface AvatarProps {
  card?: Partial<Card> | null
  size?: number
  name?: string
}

export function Avatar({ card, size = 44, name }: AvatarProps) {
  const displayName = card?.name || name || ''
  const color = card?.color_hex ? `#${card.color_hex}` : 'var(--accent)'
  const rgb = card?.color_hex ? hexRgb(card.color_hex) : '99,102,241'

  return (
    <div
      className="av-ring"
      style={{ width: size + 6, height: size + 6 }}
    >
      <div
        className="av-inner"
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.35),
          background: card?.avatar_url ? undefined : `rgba(${rgb},0.2)`,
        }}
      >
        {card?.avatar_url ? (
          <img src={card.avatar_url} alt={displayName} loading="lazy" />
        ) : (
          <span style={{ color }}>{initials(displayName)}</span>
        )}
      </div>
    </div>
  )
}
