import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function LoginScreen() {
  const { signIn, user, initializing, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (initializing) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
        <p className="text-sm text-slate-600">Loading…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/', { replace: true })
    } catch {
      /* error surfaced via context */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center bg-slate-50 px-4 py-10 font-sans antialiased">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <header className="text-center">
          <p className="flex items-center justify-center gap-1.5 text-2xl font-bold text-green-700">
<<<<<<< HEAD
            KrishiMitra
=======
            AgriSathi
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
            <Leaf className="h-7 w-7 text-green-600 transition duration-200 ease-out hover:scale-105 hover:text-green-700" strokeWidth={2} aria-hidden />
          </p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Farmer login</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in with your email and password.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-green-100 bg-white p-6 shadow-lg shadow-green-900/5">
          {error && (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800 ring-1 ring-red-100" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            data-testid="login-submit-btn"
            className="w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          New farmer?{' '}
          <Link to="/signup" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
