import { useCallback, useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Cloud, LogOut, MapPin, Sparkles, Sun, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { weatherSnapshot } from '../data/dummy'
import { useAuth } from '../hooks/useAuth'
import { fetchActivitiesForUser } from '../services/activityService'
import { fetchRemindersForUser } from '../services/reminderService'
import { uploadProfilePhoto } from '../services/storageService'

export function ProfileScreen() {
  const navigate = useNavigate()
  const { profile, user, profileLoading, saveProfilePatch, signOutUser, clearError, error } = useAuth()
  const photoInputId = useId()
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [tasksDone, setTasksDone] = useState(0)
  const [tasksPending, setTasksPending] = useState(0)
  const [reminderCount, setReminderCount] = useState(0)
  const [lastActivity, setLastActivity] = useState('—')

  const [draft, setDraft] = useState({
    fullName: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    preferredLanguage: 'English',
  })

  useEffect(() => {
    if (!profile) return
    setDraft({
      fullName: profile.fullName,
      phone: profile.phone,
      village: profile.village,
      district: profile.district,
      state: profile.state,
      preferredLanguage: profile.preferredLanguage,
    })
  }, [profile])

  const loadStats = useCallback(async () => {
    if (!user) return
    setStatsLoading(true)
    try {
      const [acts, rems] = await Promise.all([
        fetchActivitiesForUser(user.uid),
        fetchRemindersForUser(user.uid),
      ])
      setTasksDone(acts.filter((a) => a.status === 'done').length)
      setTasksPending(acts.filter((a) => a.status === 'pending').length)
      setReminderCount(rems.filter((r) => r.status === 'pending').length)
      const latest = acts[0]
      setLastActivity(latest ? latest.date : '—')
    } finally {
      setStatsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const avatarSrc = profile?.photoURL ?? user?.photoURL ?? undefined

  const onSave = async () => {
    clearError()
    setPhotoError(null)
    setSaving(true)
    try {
      await saveProfilePatch({
        fullName: draft.fullName.trim(),
        phone: draft.phone.trim(),
        village: draft.village.trim(),
        district: draft.district.trim(),
        state: draft.state.trim(),
        preferredLanguage: draft.preferredLanguage.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

  const onPhoto = async (file: File | null) => {
    if (!file || !user) return
    clearError()
    setPhotoError(null)
    setUploadingPhoto(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file)
      await saveProfilePatch({ photoURL: url })
      setPhotoError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Photo upload failed.'
      setPhotoError(msg)
      if (import.meta.env.DEV) console.error('[ProfileScreen] profile photo upload / Firestore save failed', e)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const logout = async () => {
    await signOutUser()
    navigate('/login', { replace: true })
  }

  const locationLabel =
    profile?.village && profile?.district
      ? `${profile.village}, ${profile.district}, ${profile.state}`
      : profile?.state || 'Your location'

  return (
    <div className="space-y-6 pb-28">
      {profileLoading && !profile && (
        <p className="text-center text-sm text-slate-500">Loading profile…</p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-5 shadow-lg shadow-green-900/10"
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <div
                title="Profile"
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 ring-4 ring-white shadow-md transition duration-200 ease-out hover:scale-[1.02] hover:bg-green-200"
              >
                <User className="h-10 w-10 text-green-800 transition-colors hover:text-green-900" strokeWidth={1.75} aria-hidden />
              </div>
            )}
            <label
              htmlFor={photoInputId}
              title="Change photo"
              className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow-md ring-2 ring-white transition duration-200 ease-out hover:scale-105 hover:bg-green-700"
            >
              <Camera className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span className="sr-only">Change photo</span>
            </label>
            <input
              id={photoInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
              disabled={uploadingPhoto}
            />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h2 className="truncate text-xl font-bold text-slate-900">{draft.fullName || 'Farmer'}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-green-700 transition duration-200 ease-out hover:scale-110 hover:text-green-800" strokeWidth={2} aria-hidden />
              <span className="truncate">{locationLabel}</span>
            </p>
            <button
              type="button"
              onClick={() => void logout()}
              title="Log out"
              aria-label="Log out"
              className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-800 ring-1 ring-green-200 transition duration-200 ease-out hover:scale-105 hover:bg-green-50 hover:text-green-900"
            >
              <LogOut className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Tasks completed', value: statsLoading ? '…' : String(tasksDone) },
          { label: 'Pending tasks', value: statsLoading ? '…' : String(tasksPending) },
          { label: 'Upcoming reminders', value: statsLoading ? '…' : String(reminderCount) },
          { label: 'Last activity', value: statsLoading ? '…' : lastActivity },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-green-600 transition duration-200 ease-out hover:scale-105 hover:text-green-700" strokeWidth={2} aria-hidden />
          <h3 className="text-lg font-bold text-slate-900">Your details</h3>
        </div>
        {(error || photoError) && (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">
            {error || photoError}
          </p>
        )}
        <div className="mt-4 space-y-3 text-left">
          <ProfileField label="Full name" value={draft.fullName} onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))} />
          <ProfileField label="Phone" value={draft.phone} onChange={(v) => setDraft((d) => ({ ...d, phone: v }))} />
          <ProfileField label="Village" value={draft.village} onChange={(v) => setDraft((d) => ({ ...d, village: v }))} />
          <ProfileField label="District" value={draft.district} onChange={(v) => setDraft((d) => ({ ...d, district: v }))} />
          <ProfileField label="State" value={draft.state} onChange={(v) => setDraft((d) => ({ ...d, state: v }))} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preferred language</label>
            <input
              value={draft.preferredLanguage}
              onChange={(e) => setDraft((d) => ({ ...d, preferredLanguage: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-green-100 bg-green-50/80 px-4 py-2.5 text-base font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || uploadingPhoto}
            className="mt-2 w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-md">
        <h3 className="text-lg font-bold text-slate-900">Reminder summary</h3>
        <p className="mt-2 text-sm text-slate-600">
          Manage reminders in the <strong>Tracker</strong> tab. Pending count:{' '}
          {statsLoading ? '…' : reminderCount}.
        </p>
      </section>

      <section className="rounded-3xl border border-green-100 bg-gradient-to-br from-sky-50 to-green-50 p-5 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-800">Weather snapshot</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{weatherSnapshot.place}</h3>
          </div>
          <Sun className="h-10 w-10 text-amber-500 transition duration-200 ease-out hover:scale-105 hover:text-amber-600" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-green-100">
            <p className="text-xs font-semibold text-slate-500">Temperature</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{weatherSnapshot.tempC}°C</p>
            <p className="text-sm text-slate-600">{weatherSnapshot.condition}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-green-100">
            <p className="text-xs font-semibold text-slate-500">Humidity</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{weatherSnapshot.humidity}%</p>
            <p className="flex items-center gap-1 text-sm text-slate-600">
              <Cloud className="h-4 w-4 transition duration-200 ease-out hover:scale-110" strokeWidth={2} aria-hidden />
              Rain chance {weatherSnapshot.rainChance}%
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-green-100 bg-green-50/80 px-4 py-2.5 text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
}
