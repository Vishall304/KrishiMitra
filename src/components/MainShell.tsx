import { useCallback, useState } from 'react'
import { BottomNav } from './layout/BottomNav'
import { TopNav } from './layout/TopNav'
import { AIScreen } from '../screens/AIScreen'
import { DetectScreen } from '../screens/DetectScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { TrackerScreen } from '../screens/TrackerScreen'
import type { TabId } from '../types'
import { useAuth } from '../hooks/useAuth'

export function MainShell() {
  const [tab, setTab] = useState<TabId>('home')
  const { profile, user, profileLoading } = useAuth()

  const onBell = useCallback(() => {
    setTab('tracker')
  }, [])

  const avatarSrc = profile?.photoURL ?? user?.photoURL ?? undefined

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-slate-50 font-sans text-slate-900 antialiased">
      <TopNav onBellClick={onBell} avatarSrc={avatarSrc} profileLoading={profileLoading} />

      <main className="px-4 pb-6 pt-[4.25rem]">
        {tab === 'home' && <HomeScreen onNavigate={setTab} />}
        {tab === 'detect' && <DetectScreen />}
        {tab === 'ai' && <AIScreen />}
        {tab === 'tracker' && <TrackerScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
