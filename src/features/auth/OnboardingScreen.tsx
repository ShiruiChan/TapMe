import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Users, Zap, Camera, UserCircle } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useUpsertCard, uploadAvatar } from '@/api/cards'
import { supabase } from '@/lib/supabase'
import { PALETTE, hexRgb } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

const TOTAL_STEPS = 3

export default function OnboardingScreen() {
  const { user, profile, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    name: user?.user_metadata?.full_name || profile?.full_name || '',
    role: '', tagline: '', skills: '', color: '6366f1', avatarFile: null as File | null, avatarPreview: '',
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const upsert = useUpsertCard()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const n = profile?.full_name || user?.user_metadata?.full_name
    if (n) setData(d => d.name ? d : { ...d, name: n })
  }, [profile?.full_name, user?.user_metadata?.full_name])

  function stepDots() {
    return (
      <div className="step-row">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const s = i + 1
          const cls = s < step ? 'step-dot done' : s === step ? 'step-dot active' : 'step-dot'
          return <div key={s} className={cls} />
        })}
      </div>
    )
  }

  async function finish() {
    if (!user) return
    let avatarUrl = ''
    if (data.avatarFile) {
      try { avatarUrl = await uploadAvatar(user.id, data.avatarFile) } catch { /* ignore */ }
    }
    try {
      await upsert.mutateAsync({
        name: data.name || profile?.full_name || '',
        role: data.role,
        tagline: data.tagline,
        skills: data.skills,
        color_hex: data.color,
        company: 'Lory.Lab',
        email: user.email || '',
        avatar_url: avatarUrl || undefined,
      })
      await supabase.from('profiles').update({ onboarded: true, full_name: data.name || profile?.full_name } as never).eq('id', user.id)
      await refreshProfile()
      navigate('/dashboard')
    } catch {
      toast('Ошибка при сохранении. Проверь соединение и попробуй ещё раз.')
    }
  }

  async function skip() {
    if (!user) return
    await supabase.from('profiles').update({ onboarded: true } as never).eq('id', user.id)
    await refreshProfile()
    navigate('/dashboard')
  }

  const rgb = hexRgb(data.color)

  return (
    <div className="onb-wrap">
      <div className="onb-skip">
        <button className="btn btn-ghost btn-sm" onClick={skip}>Пропустить</button>
      </div>
      {stepDots()}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1 }}
        >
          {step === 1 && (
            <div className="onb-top">
              <div className="onb-big-icon">
                <div style={{
                  width: 72, height: 72, borderRadius: 22,
                  background: 'var(--grad)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 900, color: '#fff',
                  boxShadow: '0 12px 40px var(--glow)',
                  letterSpacing: '-1px',
                }}>TM</div>
              </div>
              <div className="onb-title">Добро пожаловать<br />в Lory.Lab</div>
              <div className="onb-sub">TapMe — цифровые визитки и управление командой</div>
              <div className="onb-bullet">
                <div className="b-dot"><CreditCard size={13} /></div>
                <div className="b-text"><strong>Цифровая визитка</strong> — делись по NFC, QR или ссылке</div>
              </div>
              <div className="onb-bullet">
                <div className="b-dot"><Users size={13} /></div>
                <div className="b-text"><strong>Директория команды</strong> — все коллеги в одном месте</div>
              </div>
              <div className="onb-bullet">
                <div className="b-dot"><Zap size={13} /></div>
                <div className="b-text"><strong>Аналитика</strong> — сколько раз открыли твою карточку</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onb-top">
              <div className="onb-title">Расскажи о себе</div>
              <div className="onb-sub" style={{ marginBottom: 20 }}>Эти данные появятся на твоей карточке</div>
              <div className="av-editor-wrap">
                <div
                  className="av-editor"
                  style={data.avatarPreview ? { backgroundImage: `url(${data.avatarPreview})` } : undefined}
                  onClick={() => fileRef.current?.click()}
                >
                  {!data.avatarPreview && (
                    data.name
                      ? <span style={{ fontSize: 26, fontWeight: 700 }}>{data.name[0].toUpperCase()}</span>
                      : <UserCircle size={32} style={{ color: 'var(--muted)' }} />
                  )}
                  <div className="av-overlay"><Camera size={20} /></div>
                </div>
                <div className="av-hint">Фото профиля</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setData(d => ({ ...d, avatarFile: f, avatarPreview: URL.createObjectURL(f) }))
                  }}
                />
              </div>
              <div className="gap-10">
                <div className="field"><label>Имя и фамилия</label>
                  <input placeholder="Александр Иванов" value={data.name}
                    onChange={e => setData(d => ({ ...d, name: e.target.value }))} /></div>
                <div className="field"><label>Должность</label>
                  <input placeholder="Frontend-разработчик" value={data.role}
                    onChange={e => setData(d => ({ ...d, role: e.target.value }))} /></div>
                <div className="field"><label>Специализация / Tagline</label>
                  <input placeholder="Автоматизирую бизнес-процессы" value={data.tagline}
                    onChange={e => setData(d => ({ ...d, tagline: e.target.value }))} /></div>
                <div className="field"><label>Навыки (через запятую)</label>
                  <input placeholder="React, Python, n8n" value={data.skills}
                    onChange={e => setData(d => ({ ...d, skills: e.target.value }))} /></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onb-top">
              <div className="onb-title">Выбери стиль<br />карточки</div>
              <div className="onb-sub" style={{ marginBottom: 20 }}>Акцентный цвет — его увидят коллеги</div>
              <div
                style={{
                  borderRadius: 16, padding: '16px 20px', marginBottom: 20,
                  background: `linear-gradient(135deg,#${data.color},rgba(${rgb},.55))`,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{data.name || 'Твоё имя'}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{data.role || 'Должность'}</div>
                {data.tagline && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4, fontStyle: 'italic' }}>{data.tagline}</div>}
              </div>
              <div className="glass-card">
                <div className="card-label">Цвет акцента</div>
                <div className="color-row">
                  {PALETTE.map(h => (
                    <button
                      key={h}
                      className={`color-dot${h === data.color ? ' selected' : ''}`}
                      style={{ background: `#${h}` }}
                      onClick={() => setData(d => ({ ...d, color: h }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="gap-8" style={{ marginTop: 16 }}>
        {step < TOTAL_STEPS ? (
          <>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (step === 2 && !data.name) return toast('Введи имя')
                setStep(s => s + 1)
              }}
            >
              Далее →
            </button>
            {step > 1 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => s - 1)}>← Назад</button>
            )}
          </>
        ) : (
          <>
            <button
              className="btn btn-primary"
              style={{ background: `linear-gradient(135deg,#${data.color},#06b6d4)` }}
              onClick={finish}
              disabled={upsert.isPending}
            >
              {upsert.isPending ? 'Сохранение...' : 'Готово — открыть дашборд'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => s - 1)}>← Назад</button>
          </>
        )}
      </div>
    </div>
  )
}
