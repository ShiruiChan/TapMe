import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { useToast } from '@/components/ui/Toast'

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = (fd.get('email') as string).trim().toLowerCase()
    const password = fd.get('password') as string
    const name = (fd.get('name') as string || '').trim()

    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name) return toast('Введи имя')
        const { error } = await signUp(email, password, name)
        if (error) return toast(error.message)
        toast('Аккаунт создан! Проверь почту для подтверждения.')
        navigate('/onboarding')
      } else {
        const { error } = await signIn(email, password)
        if (error) return toast('Неверный email или пароль')
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap anim-up" style={{ position: 'relative', zIndex: 1 }}>
      <div className="auth-logo">
        <div className="logo-ring">TM</div>
        <h1>TapMe</h1>
        <p>Корпоративная платформа · Lory.Lab</p>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
          Войти
        </button>
        <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
          Регистрация
        </button>
      </div>

      <form onSubmit={handleSubmit} className="gap-12" style={{ marginBottom: 16 }}>
        {mode === 'register' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="gap-10"
          >
            <div className="field">
              <label>Имя и фамилия</label>
              <input name="name" placeholder="Александр Иванов" autoComplete="name" />
            </div>
          </motion.div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" name="email" placeholder="you@lorylab.ru" required autoComplete="email" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <div className="pw-wrap">
            <input
              type={showPw ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Загрузка...' : mode === 'login' ? 'Войти в портал' : 'Создать аккаунт'}
        </button>
      </form>

      <div className="divider">или</div>
      <button
        className="btn btn-secondary"
        onClick={() => toast('Telegram-авторизация скоро будет доступна')}
      >
        ✈️&nbsp; Войти через Telegram
      </button>
    </div>
  )
}
