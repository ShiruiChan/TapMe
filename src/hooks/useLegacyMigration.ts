import { useEffect, useState } from 'react'
import { useAuth } from '@/store/auth'
import { upsertCard, uploadAvatar } from '@/api/cards'
import { supabase } from '@/lib/supabase'

interface LegacyCard {
  name?: string; role?: string; company?: string; tagline?: string; bio?: string
  location?: string; skills?: string; email?: string; phone?: string; website?: string
  telegram?: string; vk?: string; instagram?: string; linkedin?: string; github?: string
  behance?: string; colorHex?: string; avatar?: string
}

function readLegacy(): LegacyCard | null {
  if (localStorage.getItem('tm_migrated') === 'v2') return null
  try {
    const raw = localStorage.getItem('tm_card')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function useLegacyMigration() {
  const [hasMigration, setHasMigration] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (readLegacy()) setHasMigration(true)
  }, [])

  async function migrate(): Promise<void> {
    const legacy = readLegacy()
    if (!legacy || !user) return

    let avatarUrl: string | undefined
    if (legacy.avatar?.startsWith('data:')) {
      try {
        const res = await fetch(legacy.avatar)
        const blob = await res.blob()
        const file = new File([blob], 'avatar.jpg', { type: blob.type })
        avatarUrl = await uploadAvatar(user.id, file)
      } catch { /* ignore avatar migration failures */ }
    }

    await upsertCard(user.id, {
      name: legacy.name || null,
      role: legacy.role || null,
      company: legacy.company || 'Lory.Lab',
      tagline: legacy.tagline || null,
      bio: legacy.bio || null,
      location: legacy.location || null,
      skills: legacy.skills || null,
      email: legacy.email || user.email || null,
      phone: legacy.phone || null,
      website: legacy.website || null,
      telegram: legacy.telegram || null,
      vk: legacy.vk || null,
      instagram: legacy.instagram || null,
      linkedin: legacy.linkedin || null,
      github: legacy.github || null,
      behance: legacy.behance || null,
      color_hex: (legacy.colorHex || '6366f1').replace('#', ''),
      avatar_url: avatarUrl || null,
    })

    // Mark profile as onboarded
    await supabase.from('profiles').update({ onboarded: true } as never).eq('id', user.id)

    localStorage.setItem('tm_migrated', 'v2')
    localStorage.removeItem('tm_card')
    localStorage.removeItem('tm_user')
    localStorage.removeItem('tm_users')
    localStorage.removeItem('tm_stats')
    setHasMigration(false)
  }

  function dismiss() {
    localStorage.setItem('tm_migrated', 'v2')
    setHasMigration(false)
  }

  return { hasMigration, migrate, dismiss }
}
