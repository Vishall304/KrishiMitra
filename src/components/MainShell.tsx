import { useCallback, useMemo, useState } from 'react'
import { BottomNav } from './layout/BottomNav'
import { TopNav } from './layout/TopNav'
import { NotificationsPanel, demoNotifications, type DemoNotification } from './NotificationsPanel'
import { AIScreen } from '../screens/AIScreen'
import { DetectScreen } from '../screens/DetectScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { TrackerScreen } from '../screens/TrackerScreen'
import type { TabId } from '../types'

export function MainShell() {
  const [tab, setTab] = useState<TabId>('home')
  const [notifications, setNotifications] = useState<DemoNotification[]>(demoNotifications)
  const [notifOpen, setNotifOpen] = useState(false)

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  )

  const openNotifications = useCallback(() => setNotifOpen(true), [])
  const closeNotifications = useCallback(() => setNotifOpen(false), [])
  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false }))),
    [],
  )

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-slate-50 font-sans text-slate-900 antialiased">
      <TopNav onBellClick={openNotifications} unreadCount={unreadCount} />

      <main className="px-4 pb-6 pt-[4.25rem]">
        {tab === 'home' && <HomeScreen onNavigate={setTab} />}
        {tab === 'detect' && <DetectScreen />}
        {tab === 'ai' && <AIScreen />}
        {tab === 'tracker' && <TrackerScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <NotificationsPanel
        open={notifOpen}
        onClose={closeNotifications}
        onMarkAllRead={markAllRead}
        notifications={notifications}
      />
    </div>
  )
}
