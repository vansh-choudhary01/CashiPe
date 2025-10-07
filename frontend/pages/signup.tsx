import { useState } from 'react'
import type React from 'react'
import { useRouter } from 'next/router'
import { AuthAPI, setToken } from '../lib/api'

/**
 * Sign up page for creating a new account. This page stores a token in localStorage
 * to simulate authentication and then redirects to the home page.
 */
export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { token } = await AuthAPI.register(email, password, name)
    setToken(token)
    router.push('/')
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass rounded-md h-10 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass rounded-md h-10 px-3"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full glass rounded-md h-10 px-3"
            required
          />
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-emerald-500 text-black font-medium w-full"
        >
          Sign up
        </button>
        <p className="text-sm text-neutral-300 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  )
}