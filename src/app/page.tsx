// src/app/page.tsx
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">AiSchool</h1>
              </div>
            </div>
            <div className="flex items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user?.name}!
                  </span>
                  <Link
                    href="/api/auth/signout"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/signin"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/setup-db"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Setup Database
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to AiSchool
              </h2>
              <p className="text-sm text-gray-500">
                This is an AI-powered learning platform for students.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} AiSchool. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}