import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bolt,
  Bug,
  Building2,
  CalendarDays,
  Camera,
  ChevronRight,
  CloudRain,
  Droplet,
  Lightbulb,
  Newspaper,
  Sparkles,
  Sprout,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { feedItems } from '../data/dummy'
import type { FeedItem, FeedItemKind } from '../data/dummy'
import type { TabId } from '../types'

const iconMap: Record<FeedItem['IconKey'], LucideIcon> = {
  newspaper: Newspaper,
  buildingLibrary: Building2,
  lightBulb: Lightbulb,
  trendingUp: TrendingUp,
  cloudRain: CloudRain,
  droplet: Droplet,
  sprout: Sprout,
  bug: Bug,
}

const kindLabel: Record<FeedItemKind, string> = {
  news: 'Farming news',
  scheme: 'Government scheme',
  tips: 'Farming tip',
  market: 'Market price',
  weather: 'Weather alert',
  irrigation: 'Irrigation',
  fertilizer: 'Fertiliser',
  pest: 'Pest advisory',
}

type Filter = 'all' | FeedItemKind

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'weather', label: 'Weather' },
  { key: 'market', label: 'Market' },
  { key: 'scheme', label: 'Schemes' },
  { key: 'tips', label: 'Tips' },
  { key: 'news', label: 'News' },
  { key: 'fertilizer', label: 'Fertiliser' },
  { key: 'irrigation', label: 'Irrigation' },
  { key: 'pest', label: 'Pest' },
]

type Props = {
  onNavigate: (tab: TabId) => void
}

const quickActions = [
  {
    key: 'detect',
    tooltip: 'Detect crop — photo-based crop check',
    Icon: Camera,
    tab: 'detect' as TabId,
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    key: 'ai',
    tooltip: 'Ask AI — chat in your language',
    Icon: Sparkles,
    tab: 'ai' as TabId,
    gradient: 'from-emerald-600 to-green-700',
  },
  {
    key: 'reminder',
    tooltip: 'Set reminder — irrigation and field tasks',
    Icon: CalendarDays,
    tab: 'tracker' as TabId,
    gradient: 'from-green-700 to-green-600',
  },
]

const cardIconClass =
  'h-7 w-7 text-white transition duration-200 ease-out group-hover:scale-105 group-hover:text-white'

export function HomeScreen({ onNavigate }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const visibleItems = useMemo(
    () => (filter === 'all' ? feedItems : feedItems.filter((i) => i.kind === filter)),
    [filter],
  )

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

        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.Icon
            return (
              <motion.button
                key={action.key}
                type="button"
                title={action.tooltip}
                aria-label={action.tooltip}
                data-testid={`quick-${action.key}-btn`}
                onClick={() => onNavigate(action.tab)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.985 }}
                className={`group flex aspect-square max-h-[120px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${action.gradient} p-4 text-white shadow-lg shadow-green-900/15 ring-1 ring-white/20 transition duration-200 ease-out hover:brightness-110 sm:aspect-auto sm:min-h-[104px]`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Icon className={cardIconClass} strokeWidth={2} aria-hidden />
                </span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Bolt
            className="h-5 w-5 text-green-600 transition duration-200 ease-out hover:scale-105 hover:text-green-700"
            strokeWidth={2}
          />
          <h3 className="text-lg font-bold text-slate-900">Info feed</h3>
          <span className="ml-auto text-xs font-medium text-slate-500">
            {visibleItems.length} {visibleItems.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {/* Horizontal filter chips — let the page scroll vertically */}
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]"
          style={{ scrollbarWidth: 'none' }}
          data-testid="feed-filters"
        >
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                data-testid={`feed-filter-${f.key}`}
                className={[
                  'shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition duration-200 ease-out',
                  active
                    ? 'bg-green-600 text-white shadow-sm ring-1 ring-green-700'
                    : 'bg-white text-slate-600 ring-1 ring-green-100 hover:scale-[1.02] hover:bg-green-50 hover:text-green-800',
                ].join(' ')}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-green-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">No posts in this category yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3" data-testid="feed-list">
            {visibleItems.map((item, i) => {
              const Icon = iconMap[item.IconKey]
              return (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.04 }}
                  className="flex gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-md shadow-green-900/5 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-1 ring-green-100 transition duration-200 ease-out hover:scale-105 hover:bg-green-100 hover:text-green-800">
                    <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      {kindLabel[item.kind]}
                      {item.meta ? <span className="ml-2 text-slate-400">· {item.meta}</span> : null}
                    </p>
                    <h4 className="mt-1 font-semibold leading-snug text-slate-900">{item.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                  <ChevronRight
                    className="mt-1 h-6 w-6 shrink-0 self-center text-slate-300 transition duration-200 ease-out hover:scale-105 hover:text-green-600"
                    strokeWidth={2}
                    aria-hidden
                  />
                </motion.article>
              )
            })}
          </div>
        )}
      </section>

      <motion.button
        type="button"
        onClick={() => onNavigate('ai')}
        title="Ask AI"
        aria-label="Ask AI"
        data-testid="home-ask-ai-fab"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.06 }}
        className="fixed bottom-24 right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-xl shadow-green-900/25 ring-2 ring-green-100 transition-colors duration-200 ease-out hover:bg-green-700 hover:ring-green-200"
      >
        <Sparkles className="h-7 w-7" strokeWidth={2} aria-hidden />
      </motion.button>
    </div>
  )
}
