/**
 * Клиентский скрипт для миграции данных из localStorage (v1) в Supabase (v2).
 * Запускается один раз при первом входе пользователя в новую версию.
 */

import type { Card } from '../src/lib/database.types'

interface LegacyCard {
  name?: string
  role?: string
  company?: string
  tagline?: string
  bio?: string
  location?: string
  skills?: string
  email?: string
  phone?: string
  website?: string
  telegram?: string
  vk?: string
  instagram?: string
  linkedin?: string
  github?: string
  behance?: string
  colorHex?: string
  avatar?: string
}

interface LegacyStats {
  views: number
  saves: number
  shares: number
  log: Array<{ type: string; ts: number }>
}

export function detectLegacyData(): LegacyCard | null {
  try {
    const raw = localStorage.getItem('tm_card')
    if (!raw) return null
    return JSON.parse(raw) as LegacyCard
  } catch {
    return null
  }
}

export function mapLegacyCard(legacy: LegacyCard): Partial<Card> {
  return {
    name: legacy.name || null,
    role: legacy.role || null,
    company: legacy.company || 'Lory.Lab',
    tagline: legacy.tagline || null,
    bio: legacy.bio || null,
    location: legacy.location || null,
    skills: legacy.skills || null,
    email: legacy.email || null,
    phone: legacy.phone || null,
    website: legacy.website || null,
    telegram: legacy.telegram || null,
    vk: legacy.vk || null,
    instagram: legacy.instagram || null,
    linkedin: legacy.linkedin || null,
    github: legacy.github || null,
    behance: legacy.behance || null,
    color_hex: (legacy.colorHex || '6366f1').replace('#', ''),
    // avatar: base64 data-URI — нужно загрузить в Storage отдельно
    // avatar_url заполняется после uploadAvatar
  }
}

export function getLegacyEvents(): LegacyStats['log'] {
  try {
    const raw = localStorage.getItem('tm_stats')
    if (!raw) return []
    const stats = JSON.parse(raw) as LegacyStats
    return stats.log || []
  } catch {
    return []
  }
}

export function getLegacyAvatarBase64(): string | null {
  try {
    const raw = localStorage.getItem('tm_card')
    if (!raw) return null
    const card = JSON.parse(raw) as LegacyCard
    return card.avatar?.startsWith('data:') ? card.avatar : null
  } catch {
    return null
  }
}

export function clearLegacyData(): void {
  localStorage.removeItem('tm_user')
  localStorage.removeItem('tm_users')
  localStorage.removeItem('tm_card')
  localStorage.removeItem('tm_stats')
  localStorage.setItem('tm_migrated', 'v2')
}

export function isMigrated(): boolean {
  return localStorage.getItem('tm_migrated') === 'v2'
}
