import type { Card } from './database.types'

export function downloadVCard(card: Partial<Card>): void {
  const nameParts = (card.name || '').split(' ')
  const lastName = nameParts.slice(1).join(' ')
  const firstName = nameParts[0] || ''

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name || ''}`,
    `N:${lastName};${firstName};;;`,
    card.role ? `TITLE:${card.role}` : '',
    card.company ? `ORG:${card.company}` : '',
    card.email ? `EMAIL;TYPE=WORK:${card.email}` : '',
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
    card.website ? `URL:${card.website}` : '',
    card.location ? `ADR;TYPE=WORK:;;${card.location};;;;` : '',
    card.telegram ? `X-SOCIALPROFILE;TYPE=telegram:${card.telegram}` : '',
    card.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${card.linkedin}` : '',
    card.github ? `X-SOCIALPROFILE;TYPE=github:${card.github}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  const blob = new Blob([lines], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(card.name || 'contact').replace(/\s+/g, '_')}.vcf`
  a.click()
  URL.revokeObjectURL(url)
}
