import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-600">Checking your session…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
