// src/app/auth/signin/page.tsx
'use client'

import { signIn, getProviders } from 'react'
import { useState, useEffect } from 'react'

export default function SignIn() {
  const [providers, setProviders] = useState(null)

  useEffect(() => {
    const getAuthProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    getAuthProviders()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <div className="mt-8 space-y-4">
          {providers &&
            Object.values(providers).map((provider) => (
              <div key={provider.name}>
                <button
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sign in with {provider.name}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}