'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      {/* Left Column - Form (50%) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto max-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carve</h1>
            <p className="mt-2 text-sm text-gray-600">
              Reset your password
            </p>
          </div>

          {success ? (
            <div className="rounded-lg bg-green-50 p-6">
              <h3 className="text-sm font-medium text-green-800">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-green-700">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Click the link in the email to reset your password.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-green-800 hover:text-green-900"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we&apos;ll send you a link to reset
                  your password.
                </p>

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-gray-600">
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  ← Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Right Column - Image (50%) */}
      <div className="hidden lg:block lg:w-1/2 relative h-screen max-h-screen overflow-hidden">
        <Image
          src="/loginscreen.png"
          alt="Carve Fitness"
          fill
          className="object-cover object-center"
          priority
          sizes="50vw"
        />
      </div>
    </div>
  )
}
