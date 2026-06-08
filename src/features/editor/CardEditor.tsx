import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, QrCode } from 'lucide-react'
import { useMyCard, useUpsertCard, uploadAvatar } from '@/api/cards'
import { useAuth } from '@/store/auth'
import { PALETTE, hexRgb } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { useModal } from '@/components/ui/Modal'
import QRModal from './QRModal'

const FIELDS = [
  { key: 'name', label: 'Имя и фамилия', placeholder: 'Александр Иванов' },
  { key: 'role', label: 'Должность', placeholder: 'Frontend-разработчик' },
  { key: 'company', label: 'Компания', placeholder: 'Lory.Lab' },
  { key: 'tagline', label: 'Tagline / Специализация', placeholder: 'Автоматизирую бизнес-процессы' },
] as const

const CONTACTS = [
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Телефон', type: 'tel' },
  { key: 'website', label: 'Сайт', type: 'url' },
] as const

const SOCIALS = [
  { key: 'telegram', label: 'Telegram (@username)' },
  { key: 'vk', label: 'ВКонтакте (username)' },
  { key: 'instagram', label: 'Instagram (@username)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'behance', label: 'Behance' },
] as const

export default function CardEditor() {
  const { data: card } = useMyCard()
  const { user } = useAuth()
  const upsert = useUpsertCard()
  const toast = useToast()
  const { openModal } = useModal()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [vals, setVals] = useState<Record<string, string>>(() => ({
    name: card?.name || '',
    role: card?.role || '',
    company: card?.company || 'Lory.Lab',
    tagline: card?.tagline || '',
    bio: card?.bio || '',
    location: card?.location || '',
    skills: card?.skills || '',
    email: card?.email || user?.email || '',
    phone: card?.phone || '',
    website: card?.website || '',
    telegram: card?.telegram || '',
    vk: card?.vk || '',
    instagram: card?.instagram || '',
    linkedin: card?.linkedin || '',
    github: card?.github || '',
    behance: card?.behance || '',
  }))
  const [color, setColor] = useState(card?.color_hex || '6366f1')
  const [avatarPreview, setAvatarPreview] = useState<string>(card?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const accent = color
  const rgb = hexRgb(accent)
  const skillChips = (vals.skills || '').split(',').map(s => s.trim()).filter(Boolean)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!vals.name) return toast('Введи имя')
    if (!user) return

    setUploading(true)
    try {
      let avatarUrl = card?.avatar_url || ''
      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile)
      }
      await upsert.mutateAsync({
        ...vals,
        color_hex: color,
        avatar_url: avatarUrl,
      })
      toast('Карточка сохранена ✓')
    } catch {
      toast('Ошибка сохранения')
    } finally {
      setUploading(false)
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="screen-header">
        <div>
          <div className="screen-title">Карточка</div>
          <div className="screen-sub">Редактирование профиля</div>
        </div>
        <button type="button" className="icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Avatar */}
      <div className="av-editor-wrap">
        <div
          className="av-editor"
          style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : undefined}
          onClick={() => fileRef.current?.click()}
        >
          {!avatarPreview && (
            <span style={{ fontSize: 26, fontWeight: 700 }}>
              {(vals.name || user?.email || '?')[0]?.toUpperCase()}
            </span>
          )}
          <div className="av-overlay"><Camera size={20} /></div>
        </div>
        <div className="av-hint">Нажми чтобы изменить фото</div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
      </div>

      <div className="gap-12">
        {/* Main */}
        <div className="glass-card">
          <div className="card-label">Основное</div>
          <div className="gap-10">
            {FIELDS.map(f => (
              <div key={f.key} className="field">
                <label>{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  value={vals[f.key]}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="glass-card">
          <div className="card-label">О себе</div>
          <div className="field">
            <label>Bio</label>
            <textarea
              placeholder="Несколько слов о себе..."
              value={vals.bio}
              onChange={e => setVals(v => ({ ...v, bio: e.target.value }))}
            />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>Город</label>
            <input placeholder="Москва" value={vals.location}
              onChange={e => setVals(v => ({ ...v, location: e.target.value }))} />
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card">
          <div className="card-label">Навыки</div>
          <div className="field">
            <label>Через запятую (React, Python…)</label>
            <input
              placeholder="React, Python, n8n"
              value={vals.skills}
              onChange={e => setVals(v => ({ ...v, skills: e.target.value }))}
            />
          </div>
          {skillChips.length > 0 && (
            <div className="chips-row">
              {skillChips.map(chip => <span key={chip} className="chip">{chip}</span>)}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="glass-card">
          <div className="card-label">Контакты</div>
          <div className="gap-10">
            {CONTACTS.map(f => (
              <div key={f.key} className="field">
                <label>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.label}
                  value={vals[f.key]}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Socials */}
        <div className="glass-card">
          <div className="card-label">Мессенджеры и соцсети</div>
          <div className="gap-10">
            {SOCIALS.map(f => (
              <div key={f.key} className="field">
                <label>{f.label}</label>
                <input
                  placeholder={f.label}
                  value={vals[f.key]}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="glass-card">
          <div className="card-label">Цвет акцента</div>
          {/* Preview */}
          <div style={{
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
            background: `linear-gradient(135deg,#${accent},rgba(${rgb},.55))`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{vals.name || 'Твоё имя'}</div>
            <div style={{ fontSize: 13, opacity: 0.65 }}>{vals.role || 'Должность'}</div>
          </div>
          <div className="color-row">
            {PALETTE.map(h => (
              <button
                key={h}
                type="button"
                className={`color-dot${h === color ? ' selected' : ''}`}
                style={{ background: `#${h}` }}
                onClick={() => setColor(h)}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ background: `linear-gradient(135deg,#${accent},#06b6d4)` }}
          disabled={uploading || upsert.isPending}
        >
          {(uploading || upsert.isPending) ? 'Сохранение...' : 'Сохранить карточку'}
        </button>

        {card && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => openModal('Моя карточка', <QRModal card={card} />)}
          >
            <QrCode size={16} /> QR и предпросмотр
          </button>
        )}

        <div style={{ height: 8 }} />
      </div>
    </form>
  )
}
