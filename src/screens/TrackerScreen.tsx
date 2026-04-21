import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  Pencil,
  PlusCircle,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  addActivity,
  deleteActivity,
  fetchActivitiesForUser,
  updateActivity,
} from '../services/activityService'
import {
  addReminder,
  deleteReminder,
  fetchRemindersForUser,
  updateReminder,
} from '../services/reminderService'
import { formatFirestoreError } from '../lib/firestoreErrors'
import type { ActivityRecord, ReminderRecord } from '../types/models'

const presets = ['Irrigation done', 'Fertilizer added', 'Spray completed'] as const
const presetToType = (title: string) => {
  if (title.includes('Irrigation')) return 'irrigation'
  if (title.includes('Fertilizer')) return 'fertilizer'
  if (title.includes('Spray')) return 'spray'
  return 'other'
}

function formatToday() {
  return new Date().toISOString().slice(0, 10)
}

export function TrackerScreen() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [reminders, setReminders] = useState<ReminderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openActivity, setOpenActivity] = useState(false)
  const [editActivity, setEditActivity] = useState<ActivityRecord | null>(null)

  const [preset, setPreset] = useState<string>(presets[0]!)
  const [date, setDate] = useState(formatToday())
  const [notes, setNotes] = useState('')
  const [statusAdd, setStatusAdd] = useState<'pending' | 'done'>('pending')

  const [openReminder, setOpenReminder] = useState(false)
  const [editReminder, setEditReminder] = useState<ReminderRecord | null>(null)
  const [remForm, setRemForm] = useState({
    title: '',
    description: '',
    reminderDate: formatToday(),
    reminderTime: '09:00',
    type: 'field',
    status: 'pending' as 'pending' | 'done',
  })

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [a, r] = await Promise.all([fetchActivitiesForUser(user.uid), fetchRemindersForUser(user.uid)])
      setActivities(a)
      setReminders(r)
    } catch (e) {
      if (import.meta.env.DEV) console.error('[TrackerScreen] refresh failed', e)
      setError(formatFirestoreError(e, 'load activities'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const sortedActivities = [...activities].sort((a, b) => (a.date < b.date ? 1 : -1))

  const saveNewActivity = async () => {
    if (!user) return
    try {
      await addActivity({
        userId: user.uid,
        title: preset,
        type: presetToType(preset),
        date,
        status: statusAdd,
        notes,
      })
      setOpenActivity(false)
      setNotes('')
      setDate(formatToday())
      await refresh()
    } catch (e) {
      if (import.meta.env.DEV) console.error('[TrackerScreen] add activity failed', e)
      setError(formatFirestoreError(e, 'save activity'))
    }
  }

  const saveEditActivity = async () => {
    if (!editActivity || !user) return
    try {
      await updateActivity(user.uid, editActivity.id, {
        title: editActivity.title,
        type: editActivity.type,
        date: editActivity.date,
        status: editActivity.status,
        notes: editActivity.notes,
      })
      setEditActivity(null)
      await refresh()
    } catch (e) {
      if (import.meta.env.DEV) console.error('[TrackerScreen] update activity failed', e)
      setError(formatFirestoreError(e, 'update activity'))
    }
  }

  const removeActivity = async (id: string) => {
    if (!confirm('Delete this activity?') || !user) return
    try {
      await deleteActivity(user.uid, id)
      await refresh()
    } catch (e) {
      if (import.meta.env.DEV) console.error('[TrackerScreen] delete activity failed', e)
      setError(formatFirestoreError(e, 'delete activity'))
    }
  }

  const saveReminder = async () => {
    if (!user) return
    if (!editReminder && !remForm.title.trim()) {
      setError('Please enter a reminder title.')
      return
    }
    try {
      if (editReminder) {
        await updateReminder(user.uid, editReminder.id, {
          title: remForm.title.trim(),
          description: remForm.description.trim(),
          reminderDate: remForm.reminderDate,
          reminderTime: remForm.reminderTime,
          type: remForm.type,
          status: remForm.status,
        })
        setEditReminder(null)
      } else {
        await addReminder({
          userId: user.uid,
          title: remForm.title.trim(),
          description: remForm.description.trim(),
          reminderDate: remForm.reminderDate,
          reminderTime: remForm.reminderTime,
          type: remForm.type,
          status: remForm.status,
        })
        setOpenReminder(false)
      }
      setRemForm({
        title: '',
        description: '',
        reminderDate: formatToday(),
        reminderTime: '09:00',
        type: 'field',
        status: 'pending',
      })
      await refresh()
    } catch (e) {
      if (import.meta.env.DEV) console.error('[TrackerScreen] save reminder failed', e)
      setError(formatFirestoreError(e, 'save reminder'))
    }
  }

  const removeReminder = async (id: string) => {
    if (!confirm('Delete this reminder?') || !user) return
    try {
      await deleteReminder(user.uid, id)
      await refresh()
    } catch (e) {
      if (import.meta.env.DEV) console.error('[TrackerScreen] delete reminder failed', e)
      setError(formatFirestoreError(e, 'delete reminder'))
    }
  }

  const openEditReminder = (r: ReminderRecord) => {
    setEditReminder(r)
    setRemForm({
      title: r.title,
      description: r.description,
      reminderDate: r.reminderDate,
      reminderTime: r.reminderTime,
      type: r.type,
      status: r.status,
    })
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity tracker</h2>
          <p className="mt-1 text-sm text-slate-600">Synced with your Firebase account.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpenActivity(true)}
          title="Add activity"
          aria-label="Add activity"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-900/15 transition duration-200 ease-out hover:scale-105 hover:bg-green-700 active:scale-[0.99] sm:self-auto"
        >
          <PlusCircle className="h-7 w-7" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-800 ring-1 ring-red-100">{error}</p>
      )}

      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-md shadow-green-900/5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Clock className="h-6 w-6 text-green-600 transition duration-200 ease-out hover:scale-105 hover:text-green-700" strokeWidth={2} />
            Reminders
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditReminder(null)
              setRemForm({
                title: '',
                description: '',
                reminderDate: formatToday(),
                reminderTime: '09:00',
                type: 'field',
                status: 'pending',
              })
              setOpenReminder(true)
            }}
            title="Add reminder"
            aria-label="Add reminder"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-green-700 transition duration-200 ease-out hover:scale-105 hover:bg-green-100 hover:text-green-900"
          >
            <PlusCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
          </button>
        </div>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : reminders.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No reminders yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-2xl bg-green-50 px-4 py-3 ring-1 ring-green-100"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{r.description}</p>
                  <p className="mt-1 text-sm font-semibold text-green-800">
                    {r.reminderDate} · {r.reminderTime}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    title="Edit reminder"
                    aria-label="Edit reminder"
                    onClick={() => openEditReminder(r)}
                    className="rounded-full p-2 text-green-800 transition duration-200 ease-out hover:scale-105 hover:bg-green-100 hover:text-green-900"
                  >
                    <Pencil className="h-5 w-5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    title="Delete reminder"
                    aria-label="Delete reminder"
                    onClick={() => void removeReminder(r.id)}
                    className="rounded-full p-2 text-red-700 transition duration-200 ease-out hover:scale-105 hover:bg-red-50 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="px-1 text-lg font-bold text-slate-900">Your activities</h3>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : sortedActivities.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No activities logged yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {sortedActivities.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start justify-between gap-2 rounded-3xl border border-green-100 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{a.date}</p>
                  {a.notes ? <p className="mt-1 text-sm text-slate-600">{a.notes}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
                      a.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
                        : 'bg-amber-100 text-amber-900 ring-1 ring-amber-200'
                    }`}
                  >
                    {a.status === 'done' ? (
                      <CheckCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
                    ) : (
                      <Clock className="h-5 w-5" strokeWidth={2} aria-hidden />
                    )}
                    {a.status === 'done' ? 'Done' : 'Pending'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Edit activity"
                      aria-label="Edit activity"
                      onClick={() => setEditActivity({ ...a })}
                      className="rounded-full p-2 text-green-800 transition duration-200 ease-out hover:scale-105 hover:bg-green-50 hover:text-green-900"
                    >
                      <Pencil className="h-5 w-5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      title="Delete activity"
                      aria-label="Delete activity"
                      onClick={() => void removeActivity(a.id)}
                      className="rounded-full p-2 text-red-700 transition duration-200 ease-out hover:scale-105 hover:bg-red-50 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {openActivity && (
          <ModalWrap onClose={() => setOpenActivity(false)} title="Add activity">
            <label className="mt-2 block text-sm font-semibold text-slate-700">Activity</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-green-500"
            >
              {presets.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="mt-4 block text-sm font-semibold text-slate-700">Status</label>
            <select
              value={statusAdd}
              onChange={(e) => setStatusAdd(e.target.value as 'pending' | 'done')}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Optional notes"
            />
            <button
              type="button"
              onClick={() => void saveNewActivity()}
              className="mt-5 w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              Save activity
            </button>
          </ModalWrap>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editActivity && (
          <ModalWrap onClose={() => setEditActivity(null)} title="Edit activity">
            <label className="mt-2 block text-sm font-semibold text-slate-700">Title</label>
            <input
              value={editActivity.title}
              onChange={(e) => setEditActivity({ ...editActivity, title: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="mt-4 block text-sm font-semibold text-slate-700">Type</label>
            <input
              value={editActivity.type}
              onChange={(e) => setEditActivity({ ...editActivity, type: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="mt-4 block text-sm font-semibold text-slate-700">Date</label>
            <input
              type="date"
              value={editActivity.date}
              onChange={(e) => setEditActivity({ ...editActivity, date: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="mt-4 block text-sm font-semibold text-slate-700">Status</label>
            <select
              value={editActivity.status}
              onChange={(e) =>
                setEditActivity({ ...editActivity, status: e.target.value as 'done' | 'pending' })
              }
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Notes</label>
            <textarea
              value={editActivity.notes}
              onChange={(e) => setEditActivity({ ...editActivity, notes: e.target.value })}
              rows={2}
              className="mt-2 w-full resize-none rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => void saveEditActivity()}
              className="mt-5 w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              Update activity
            </button>
          </ModalWrap>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(openReminder || editReminder) && (
          <ModalWrap
            onClose={() => {
              setOpenReminder(false)
              setEditReminder(null)
            }}
            title={editReminder ? 'Edit reminder' : 'Add reminder'}
          >
            <label className="mt-2 block text-sm font-semibold text-slate-700">Title</label>
            <input
              value={remForm.title}
              onChange={(e) => setRemForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <label className="mt-4 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={remForm.description}
              onChange={(e) => setRemForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="mt-2 w-full resize-none rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  value={remForm.reminderDate}
                  onChange={(e) => setRemForm((f) => ({ ...f, reminderDate: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Time</label>
                <input
                  type="time"
                  value={remForm.reminderTime}
                  onChange={(e) => setRemForm((f) => ({ ...f, reminderTime: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <label className="mt-4 block text-sm font-semibold text-slate-700">Type</label>
            <input
              value={remForm.type}
              onChange={(e) => setRemForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. irrigation, soil"
            />
            <label className="mt-4 block text-sm font-semibold text-slate-700">Status</label>
            <select
              value={remForm.status}
              onChange={(e) =>
                setRemForm((f) => ({ ...f, status: e.target.value as 'pending' | 'done' }))
              }
              className="mt-2 w-full rounded-2xl border border-green-100 bg-slate-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
            <button
              type="button"
              onClick={() => void saveReminder()}
              className="mt-5 w-full rounded-2xl bg-green-600 py-3 text-base font-semibold text-white shadow-md transition hover:bg-green-700"
            >
              {editReminder ? 'Save reminder' : 'Add reminder'}
            </button>
          </ModalWrap>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalWrap({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-green-100 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-lg font-bold text-slate-900">{title}</h4>
          <button
            type="button"
            title="Close"
            aria-label="Close"
            className="rounded-full p-2 text-slate-500 transition duration-200 ease-out hover:scale-105 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
