import type { Card } from './database.types'

export function toB64(obj: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromB64(s: string): unknown {
  return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))))
}

export function cardUrl(card: Partial<Card>): string {
  const payload = {
    name: card.name,
    role: card.role,
    company: card.company,
    tagline: card.tagline,
    bio: card.bio,
    location: card.location,
    skills: card.skills,
    email: card.email,
    phone: card.phone,
    website: card.website,
    telegram: card.telegram,
    vk: card.vk,
    instagram: card.instagram,
    linkedin: card.linkedin,
    github: card.github,
    behance: card.behance,
    colorHex: card.color_hex,
    avatar: card.avatar_url,
    slug: card.slug,
  }
  return `${location.origin}${location.pathname}?d=${toB64(payload)}`
}

export function slugUrl(slug: string): string {
  return `${location.origin}/c/${slug}`
}
