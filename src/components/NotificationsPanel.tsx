import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  CheckCircle2,
  CloudRain,
  Droplet,
  Landmark,
  Sprout,
  X,
} from 'lucide-react'

export type DemoNotification = {
  id: string
  title: string
  description: string
  time: string
  kind: 'weather' | 'reminder' | 'scheme' | 'tip' | 'fertilizer'
  unread?: boolean
}

export const demoNotifications: DemoNotification[] = [
  {
    id: 'n1',
    title: 'Rain alert — 12 mm expected today',
    description:
      'Cover harvested produce near Field B and delay any foliar spray until tomorrow evening.',
    time: 'Just now',
    kind: 'weather',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Irrigation reminder due',
    description: 'Drip run scheduled for Field B at 5:00 PM today.',
    time: '2 hr ago',
    kind: 'reminder',
    unread: true,
  },
  {
    id: 'n3',
    title: 'New scheme: PMFBY deadline in 9 days',
    description: 'Opt-in for Pradhan Mantri Fasal Bima Yojana through your KCC bank branch.',
    time: 'Today, 9:00 AM',
    kind: 'scheme',
  },
  {
    id: 'n4',
    title: 'Tip: white fly watch on cotton',
    description:
      'Scout 20 plants/acre. If > 6 flies/leaf, spray neem oil 3 ml/L in the evening.',
    time: 'Yesterday',
    kind: 'tip',
  },
  {
    id: 'n5',
    title: 'Fertilizer reminder — urea top-dressing',
    description: 'Plan the second urea split before next irrigation to reduce volatile loss.',
    time: 'Yesterday',
    kind: 'fertilizer',
  },
]

const kindIcon: Record<DemoNotification['kind'], LucideIcon> = {
  weather: CloudRain,
  reminder: Bell,
  scheme: Landmark,
  tip: Sprout,
  fertilizer: Droplet,
}

const kindTint: Record<DemoNotification['kind'], string> = {
  weather: 'bg-sky-50 text-sky-700 ring-sky-100',
  reminder: 'bg-amber-50 text-amber-800 ring-amber-100',
  scheme: 'bg-violet-50 text-violet-700 ring-violet-100',
  tip: 'bg-green-50 text-green-700 ring-green-100',
  fertilizer: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
}

type Props = {
  open: boolean
  onClose: () => void
  onMarkAllRead?: () => void
  notifications?: DemoNotification[]
}

export function NotificationsPanel({
  open,
  onClose,
  onMarkAllRead,
  notifications = demoNotifications,
}: Props) {
  if (!open) return null

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/30 sm:items-start sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      data-testid="notifications-panel"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-none bg-white shadow-2xl sm:mt-14 sm:h-auto sm:max-h-[80vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-green-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                data-testid="notif-mark-all-read"
                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 ring-1 ring-green-100 transition duration-200 ease-out hover:scale-[1.03] hover:bg-green-100"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close"
              aria-label="Close notifications"
              data-testid="notif-close-btn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition duration-200 ease-out hover:scale-105 hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </header>

        <ul className="flex-1 space-y-0 overflow-y-auto px-2 py-2">
          {notifications.map((n) => {
            const Icon = kindIcon[n.kind]
            return (
              <li key={n.id} data-testid={`notif-item-${n.id}`} className="px-3">
                <div
                  className={[
                    'flex items-start gap-3 rounded-2xl p-3 transition',
                    n.unread ? 'bg-green-50/70 ring-1 ring-green-100' : 'hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${kindTint[n.kind]}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-start gap-2">
                      <p className="flex-1 font-semibold text-slate-900">{n.title}</p>
                      {n.unread && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-600" aria-hidden />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.description}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{n.time}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
