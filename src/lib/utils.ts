export const PALETTE = ['6c63ff', '6366f1', '06b6d4', '10b981', 'f59e0b', 'ef4444', 'ec4899', '8b5cf6']

export function initials(name: string): string {
  return (name || '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}

export function hexRgb(h: string): string {
  h = (h || '6366f1').replace('#', '')
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`
}

export function fmtDate(ts: string | number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'только что'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад'
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

export function declTeam(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'человек'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'человека'
  return 'человек'
}

export function norm(val: string, domain?: string): string {
  val = (val || '').trim().replace(/^https?:\/\//i, '')
  if (!val) return ''
  if (!domain) return 'https://' + val
  return 'https://' + (val.includes('.') ? val : `${domain}/${val}`)
}

export function generateVisitorId(): string {
  const stored = sessionStorage.getItem('tm_vid')
  if (stored) return stored
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
  sessionStorage.setItem('tm_vid', id)
  return id
}
