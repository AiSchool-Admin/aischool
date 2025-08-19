// src/app/auth/signin/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export default function SignIn() {
  useEffect(() => {
    // Redirect to home if already authenticated
    signIn('google', { callbackUrl: '/' })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Redirecting to Google Sign-In...
          </h1>
          <p className="text-gray-600">
            Please wait while we redirect you to Google for authentication.
          </p>
        </div>
      </div>
    </div>
  )
}