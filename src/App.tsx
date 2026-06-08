import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ModalProvider } from '@/components/ui/Modal'
import { AppShell } from '@/components/layout/AppShell'
import { Orbs } from '@/components/Orbs'
import { useAuth } from '@/store/auth'

const AuthScreen = lazy(() => import('@/features/auth/AuthScreen'))
const OnboardingScreen = lazy(() => import('@/features/auth/OnboardingScreen'))
const PublicCardPage = lazy(() => import('@/pages/PublicCardPage'))
const CardEditor = lazy(() => import('@/features/editor/CardEditor'))
const TabPage = lazy(() => import('@/pages/TabPage'))

const qc = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--muted)',
      fontSize: 14,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff',
          margin: '0 auto 12px',
        }}>TM</div>
        <div>Загрузка...</div>
      </div>
    </div>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (user && !profile?.onboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function RootRedirect() {
  const [searchParams] = useSearchParams()
  const { user, loading, profile } = useAuth()

  // Legacy shared card via ?d=base64 — показываем публичную карточку
  if (searchParams.get('d')) {
    const PublicCardPage = lazy(() => import('@/pages/PublicCardPage'))
    return (
      <Suspense fallback={<LoadingScreen />}>
        <PublicCardPage />
      </Suspense>
    )
  }

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (!profile?.onboarded) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth()

  if (loading) return <LoadingScreen />
  if (user && profile?.onboarded) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <Orbs />
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public card routes */}
                  <Route path="/c/:slug" element={<PublicCardPage />} />

                  {/* Root: redirect based on auth, or show legacy ?d= card */}
                  <Route path="/" element={<RootRedirect />} />

                  {/* Auth */}
                  <Route path="/auth" element={
                    <PublicGuard>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <AuthScreen />
                      </div>
                    </PublicGuard>
                  } />

                  {/* Onboarding */}
                  <Route path="/onboarding" element={
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <OnboardingScreen />
                    </div>
                  } />

                  {/* Authenticated app */}
                  <Route element={
                    <AuthGuard>
                      <AppShell />
                    </AuthGuard>
                  }>
                    <Route path="/dashboard" element={<TabPage />} />
                    <Route path="/directory" element={<TabPage />} />
                    <Route path="/profile" element={<TabPage />} />
                    <Route path="/editor" element={<CardEditor />} />
                    <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/:tabKey" element={<TabPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
