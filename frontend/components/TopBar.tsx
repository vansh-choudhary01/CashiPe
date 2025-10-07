import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthAPI } from '../lib/api'
import { useRouter } from 'next/router'

/**
 * TopBar displays the logo and quick navigation links.
 */
export default function TopBar() {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  useEffect(() => {
    // Read token from localStorage on client
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('cashpe-token'))
    }
  }, [])
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/70 border-b border-white/10">
      <div className="container-px h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            cashi<span className="text-emerald-400">Pe</span>
          </span>
          <span className="hidden sm:inline text-xs text-neutral-400">
            Instant Cash for Your Tech
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/refurbished" className="glass h-9 px-3 rounded-md text-sm">
            Buy
          </Link>
          <Link
            href="/accessories"
            className="glass h-9 px-3 rounded-md text-sm hidden sm:inline"
          >
            Accessories
          </Link>
          {token ? (
            <>
              <Link href="/profile" className="glass h-9 px-3 rounded-md text-sm">
                Account
              </Link>
              <button
                className="glass h-9 px-3 rounded-md text-sm"
                onClick={async () => {
                  await AuthAPI.logout()
                  setToken(null)
                  router.push('/login')
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="glass h-9 px-3 rounded-md text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}