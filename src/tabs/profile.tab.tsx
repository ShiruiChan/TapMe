import { UserCircle, Pencil, Globe, Lock, Link2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TabModule, TabContext } from './registry'
import { useAuth } from '@/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

function Profile({ ctx }: { ctx: TabContext }) {
  const { card, profile } = ctx
  const { signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const skills = (card?.skills || '').split(',').map(s => s.trim()).filter(Boolean)

  async function togglePrivacy() {
    if (!card) return
    const { error } = await supabase
      .from('cards')
      .update({ is_public: !card.is_public } as never)
      .eq('id', card.id)
    if (error) { toast('Ошибка изменения приватности'); return }
    await refreshProfile()
    toast(card.is_public ? 'Карточка скрыта' : 'Карточка публична')
  }

  return (
    <div>
      <div className="screen-header">
        <div>
          <div className="screen-title">Профиль</div>
          <div className="screen-sub">Настройки аккаунта</div>
        </div>
      </div>

      {/* Profile card */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Avatar card={card} size={56} name={profile?.full_name || ''} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{profile?.full_name || '—'}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{profile?.email}</div>
            {profile?.department && (
              <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2 }}>{profile.department}</div>
            )}
          </div>
        </div>

        {card?.bio && (
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>{card.bio}</p>
        )}

        {skills.length > 0 && (
          <div className="chips-row">
            {skills.map(s => <span key={s} className="chip">{s}</span>)}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-label">Настройки</div>

        <div className="settings-row" onClick={() => navigate('/editor')}>
          <div className="settings-icon"><Pencil size={17} /></div>
          <div className="settings-info">
            <div className="settings-name">Редактировать карточку</div>
            <div className="settings-sub">Имя, контакты, соцсети</div>
          </div>
          <div className="settings-arr">›</div>
        </div>

        <div className="settings-row" onClick={togglePrivacy}>
          <div className="settings-icon">{card?.is_public ? <Globe size={17} /> : <Lock size={17} />}</div>
          <div className="settings-info">
            <div className="settings-name">Видимость карточки</div>
            <div className="settings-sub">{card?.is_public ? 'Карточка публична' : 'Карточка скрыта'}</div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 100,
            background: card?.is_public ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: card?.is_public ? '#34d399' : '#f87171',
            fontSize: 12, fontWeight: 600,
          }}>
            {card?.is_public ? 'Публично' : 'Скрыто'}
          </div>
        </div>

        {card && (
          <div className="settings-row" onClick={() => {
            const slug = card.slug
            if (slug) {
              navigator.clipboard?.writeText(`${location.origin}/c/${slug}`)
                .then(() => toast('Ссылка скопирована!'))
            }
          }}>
            <div className="settings-icon"><Link2 size={17} /></div>
            <div className="settings-info">
              <div className="settings-name">Моя ссылка</div>
              <div className="settings-sub" style={{ wordBreak: 'break-all' }}>
                {card.slug ? `${location.origin}/c/${card.slug}` : 'Сохрани карточку чтобы получить ссылку'}
              </div>
            </div>
            <div className="settings-arr">›</div>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="card-label">Аккаунт</div>
        <div className="settings-row" onClick={signOut}>
          <div className="settings-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><LogOut size={17} /></div>
          <div className="settings-info">
            <div className="settings-name" style={{ color: '#f87171' }}>Выйти из аккаунта</div>
            <div className="settings-sub">{profile?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}

export default {
  key: 'profile',
  title: 'Профиль',
  Icon: UserCircle,
  position: 2,
  Component: Profile,
} satisfies TabModule
