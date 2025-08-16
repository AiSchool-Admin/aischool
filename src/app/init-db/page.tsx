// src/app/init-db/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InitDB() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const initDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
      })
      
      if (response.ok) {
        setMessage('Database initialized successfully!')
        setTimeout(() => router.push('/'), 2000)
      } else {
        setMessage('Failed to initialize database')
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="minh-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Initialize Database</h1>
          <p className="mt-2 text-gray-600">
            Click the button below to create the database tables
          </p>
        </div>
        
        <button
          onClick={initDatabase}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Initializing...' : 'Initialize Database'}
        </button>
        
        {message && (
          <div className={`mt-4 p-4 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}