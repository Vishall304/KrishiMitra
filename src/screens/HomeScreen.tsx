import { motion } from 'framer-motion'
import {
  BoltIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChevronRightIcon,
  NewspaperIcon,
  BuildingLibraryIcon,
  LightBulbIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { feedItems } from '../data/dummy'
import type { TabId } from '../types'

const iconMap = {
  newspaper: NewspaperIcon,
  buildingLibrary: BuildingLibraryIcon,
  lightBulb: LightBulbIcon,
} as const

type Props = {
  onNavigate: (tab: TabId) => void
}

const quickActions = [
  {
    key: 'detect',
    title: 'Detect Crop',
    emoji: '📸',
    subtitle: 'Photo-based crop check',
    Icon: CameraIcon,
    tab: 'detect' as TabId,
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    key: 'ai',
    title: 'Ask AI',
    emoji: '🤖',
    subtitle: 'Chat in your language',
    Icon: SparklesIcon,
    tab: 'ai' as TabId,
    gradient: 'from-emerald-600 to-green-700',
  },
  {
    key: 'reminder',
    title: 'Set Reminder',
    emoji: '⏰',
    subtitle: 'Irrigation & field tasks',
    Icon: CalendarDaysIcon,
    tab: 'tracker' as TabId,
    gradient: 'from-green-700 to-green-600',
  },
]

export function HomeScreen({ onNavigate }: Props) {
  return (
    <div className="space-y-6 pb-28">
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2 px-1">
          <div>
            <p className="text-sm font-medium text-green-800">Welcome back</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Your farm dashboard</h2>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Season: Kharif
          </span>
        </div>

        <div className="grid gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.key}
              type="button"
              onClick={() => onNavigate(action.tab)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.985 }}
              className={`flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br ${action.gradient} p-4 text-left text-white shadow-lg shadow-green-900/15 ring-1 ring-white/20`}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <action.Icon className="h-8 w-8" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-lg font-bold leading-tight">
                  <span aria-hidden>{action.emoji}</span>
                  {action.title}
                </span>
                <span className="mt-0.5 block text-sm font-medium text-white/90">{action.subtitle}</span>
              </span>
              <ChevronRightIcon className="h-6 w-6 shrink-0 text-white/80" aria-hidden />
            </motion.button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <BoltIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-bold text-slate-900">Info feed</h3>
        </div>
        <div className="flex max-h-[min(52vh,420px)] flex-col gap-3 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]">
          {feedItems.map((item, i) => {
            const Icon = iconMap[item.IconKey]
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-md shadow-green-900/5"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-1 ring-green-100">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    {item.kind === 'news' && 'Farming news'}
                    {item.kind === 'scheme' && 'Government schemes'}
                    {item.kind === 'tips' && 'Farming tips'}
                  </p>
                  <h4 className="mt-1 font-semibold leading-snug text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      <motion.button
        type="button"
        onClick={() => onNavigate('ai')}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.03 }}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-green-900/25 ring-2 ring-green-100"
        aria-label="Open AI assistant"
      >
        <SparklesIcon className="h-5 w-5" />
        Ask AI
      </motion.button>
    </div>
  )
}
