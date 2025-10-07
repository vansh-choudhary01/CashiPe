import TopBar from './TopBar'
import BottomNav from './BottomNav'
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
const ToastHost = dynamic(() => import('./ToastHost'), { ssr: false })
/**
 * Layout wraps every page with the top bar and bottom navigation.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white text-neutral-900">
      <ToastHost />
      <TopBar />
      <main className="flex-1 container-px">{children}</main>
      <BottomNav />
    </div>
  )
}