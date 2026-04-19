import { motion } from 'framer-motion'
import {
  ChartBarSquareIcon,
  CameraIcon,
  HomeIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid'
import type { TabId } from '../../types'

type TabDef = {
  id: TabId
  label: string
  emoji: string
  Icon: typeof HomeIcon
}

const leftTabs: TabDef[] = [
  { id: 'home', label: 'Home', emoji: '🏠', Icon: HomeIcon },
  { id: 'detect', label: 'Detect', emoji: '📸', Icon: CameraIcon },
]

const rightTabs: TabDef[] = [
  { id: 'tracker', label: 'Tracker', emoji: '📊', Icon: ChartBarSquareIcon },
  { id: 'profile', label: 'Profile', emoji: '👤', Icon: UserCircleIcon },
]

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

function TabButton({
  tab,
  active,
  onChange,
}: {
  tab: TabDef
  active: TabId
  onChange: (id: TabId) => void
}) {
  const isActive = active === tab.id
  return (
    <button
      type="button"
      onClick={() => onChange(tab.id)}
      aria-label={`${tab.label} ${tab.emoji}`}
      aria-current={isActive ? 'page' : undefined}
      className="group flex min-w-0 flex-1 flex-col items-center gap-1 pb-2 pt-1 text-[11px] font-semibold text-slate-500 transition active:scale-95 data-[active=true]:text-green-700"
      data-active={isActive}
    >
      <span
        className={[
          'inline-flex h-11 w-11 items-center justify-center rounded-2xl transition',
          isActive
            ? 'bg-green-100 text-green-800 shadow-sm ring-1 ring-green-200/80'
            : 'bg-slate-100 text-slate-500 group-hover:bg-green-50',
        ].join(' ')}
      >
        <tab.Icon className="h-6 w-6" />
      </span>
      <span className="truncate leading-tight">
        {tab.label} {tab.emoji}
      </span>
    </button>
  )
}

export function BottomNav({ active, onChange }: Props) {
  const aiActive = active === 'ai'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-green-100 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_30px_rgba(22,163,74,0.08)] backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between px-1">
        {leftTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} active={active} onChange={onChange} />
        ))}

        <div className="relative flex w-[4.5rem] shrink-0 flex-col items-center pb-2">
          <motion.button
            type="button"
            onClick={() => onChange('ai')}
            aria-label="AI assistant"
            aria-current={aiActive ? 'page' : undefined}
            whileTap={{ scale: 0.94 }}
            className={[
              'absolute -top-9 flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full text-white shadow-xl ring-4 transition',
              aiActive
                ? 'bg-green-600 ring-green-100'
                : 'bg-green-500 ring-white hover:bg-green-600',
            ].join(' ')}
          >
            <SparklesIcon className="h-8 w-8 drop-shadow" />
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">🤖 AI</span>
          </motion.button>
          <span className="invisible text-[11px]">AI</span>
        </div>

        {rightTabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} active={active} onChange={onChange} />
        ))}
      </div>
    </nav>
  )
}
