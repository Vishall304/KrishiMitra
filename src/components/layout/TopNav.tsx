import { BellIcon } from '@heroicons/react/24/outline'

type Props = {
  onBellClick?: () => void
  avatarSrc?: string | null
  profileLoading?: boolean
}

export function TopNav({ onBellClick, avatarSrc, profileLoading }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-green-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-green-700 sm:text-xl">
            AgriSathi <span aria-hidden="true">🌱</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBellClick}
            aria-label="Notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-800 transition hover:bg-green-100 active:scale-95"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-green-200 bg-gradient-to-br from-green-100 to-green-50 ring-2 ring-white shadow"
            aria-hidden="true"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg text-green-800">👤</span>
            )}
            {profileLoading && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-300 border-t-green-700" />
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
