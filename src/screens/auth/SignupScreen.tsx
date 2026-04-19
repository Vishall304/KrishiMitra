import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const languages = ['English', 'हिंदी', 'मराठी']

export function SignupScreen() {
  const { signUp, user, initializing, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    village: '',
    district: '',
    state: '',
    preferredLanguage: languages[0]!,
  })

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

  const updateField =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      await signUp({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        village: form.village.trim(),
        district: form.district.trim(),
        state: form.state.trim(),
        preferredLanguage: form.preferredLanguage,
      })
      navigate('/', { replace: true })
    } catch {
      /* surfaced */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-slate-50 px-4 py-8 font-sans antialiased">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <header className="text-center">
          <p className="text-2xl font-bold text-green-700">
            AgriSathi <span aria-hidden>🌱</span>
          </p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Create farmer account</h1>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-3xl border border-green-100 bg-white p-5 shadow-lg shadow-green-900/5"
        >
          {error && (
            <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800 ring-1 ring-red-100" role="alert">
              {error}
            </p>
          )}

          <Field label="Full name" id="su-name" value={form.fullName} onChange={updateField('fullName')} required />
          <Field label="Phone" id="su-phone" type="tel" value={form.phone} onChange={updateField('phone')} required />
          <Field label="Email" id="su-email" type="email" autoComplete="email" value={form.email} onChange={updateField('email')} required />
          <Field
            label="Password"
            id="su-pass"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={updateField('password')}
            required
            minLength={6}
          />
          <Field label="Village" id="su-village" value={form.village} onChange={updateField('village')} required />
          <Field label="District" id="su-district" value={form.district} onChange={updateField('district')} required />
          <Field label="State" id="su-state" value={form.state} onChange={updateField('state')} required />

          <div>
            <label htmlFor="su-lang" className="text-sm font-semibold text-slate-700">
              Preferred language
            </label>
            <select
              id="su-lang"
              value={form.preferredLanguage}
              onChange={updateField('preferredLanguage')}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="pb-8 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-green-700 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  required,
  minLength,
  autoComplete,
}: {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}
