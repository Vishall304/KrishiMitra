import { Bell, Leaf, User } from 'lucide-react'

type Props = {
  onBellClick?: () => void
  avatarSrc?: string | null
  profileLoading?: boolean
}

const iconBtn =
  'inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-200 ease-out hover:scale-105 active:scale-95'

export function TopNav({ onBellClick, avatarSrc, profileLoading }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-green-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-green-700 sm:text-xl">
            AgriSathi
            <Leaf
              className="h-6 w-6 shrink-0 text-green-600 transition duration-200 ease-out hover:scale-105 hover:text-green-700 sm:h-7 sm:w-7"
              strokeWidth={2}
              aria-hidden
            />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBellClick}
            title="Open activity tracker (notifications)"
            aria-label="Notifications — open activity tracker"
            className={`relative ${iconBtn} bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900`}
          >
            <Bell className="h-6 w-6" strokeWidth={2} aria-hidden />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-green-200 bg-gradient-to-br from-green-100 to-green-50 ring-2 ring-white shadow"
            title="Account"
            aria-hidden="true"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-green-800 transition duration-200 ease-out hover:scale-105 hover:text-green-900">
                <User className="h-6 w-6" strokeWidth={2} aria-hidden />
              </span>
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
