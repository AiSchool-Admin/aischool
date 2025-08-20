// src/app/auth/dev-signin/page.tsx
'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useState, useEffect } from 'react'

type Provider = {
  id: string
  name: string
}

export default function DevSignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)

  useEffect(() => {
    const setupProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    setupProviders()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            AiSchool Dev Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            For development and testing purposes only.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Button for Development Login */}
          {providers?.credentials && (
            <div>
              <button
                onClick={() => signIn('credentials', { callbackUrl: '/' })}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in as Test User
              </button>
            </div>
          )}

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-500">Or continue with</span>
            </div>
          </div>


          {/* Button for Google Login */}
          {providers?.google && (
             <div>
               <button
                 onClick={() => signIn('google', { callbackUrl: '/' })}
                 className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
               >
                 Sign in with Google
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
