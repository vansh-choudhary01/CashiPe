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
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-neutral-200">
      <div className="container-px h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            cashi<span className="text-emerald-400">Pe</span>
          </span>
          <span className="hidden sm:inline text-xs text-neutral-600">
            Instant Cash for Your Tech
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/refurbished" className="h-9 px-3 rounded-md text-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-200">
            Buy
          </Link>
          <Link
            href="/accessories"
            className="h-9 px-3 rounded-md text-sm hidden sm:inline bg-neutral-100 hover:bg-neutral-200 border border-neutral-200"
          >
            Accessories
          </Link>
          {token ? (
            <>
              <Link href="/profile" className="h-9 px-3 rounded-md text-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-200">
                Account
              </Link>
              <button
                className="h-9 px-3 rounded-md text-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-200"
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
            <Link href="/login" className="h-9 px-3 rounded-md text-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-200">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}