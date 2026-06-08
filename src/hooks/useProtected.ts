import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'

export function useProtected() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true })
    }
  }, [user, loading, navigate])

  return { user, loading }
}
