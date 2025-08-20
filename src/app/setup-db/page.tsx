// src/app/setup-db/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupDB() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')
  const [errorData, setErrorData] = useState('')
  const router = useRouter()

  const initDatabase = async () => {
    setLoading(true)
    setMessage('')
    setDetails('')
    setErrorData('')
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.text()
      console.log('Response:', response.status, data)
      
      if (response.ok) {
        try {
          const jsonData = JSON.parse(data)
          setMessage('Database initialized successfully!')
          setDetails(jsonData.message)
          setTimeout(() => router.push('/'), 2000)
        } catch (e) {
          setMessage('Database initialized successfully!')
          setDetails(data)
        }
      } else {
        setMessage('Failed to initialize database')
        setErrorData(`Status: ${response.status}`)
        try {
          const jsonData = JSON.parse(data)
          setDetails(jsonData.error || jsonData.message || data)
        } catch (e) {
          setDetails(data)
        }
      }
    } catch (error: any) {
      setMessage('Error: ' + (error?.message || 'Unknown error'))
      setDetails('Network error or API not responding')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            <div className="font-medium">{message}</div>
            {errorData && <div className="text-sm mt-1">{errorData}</div>}
            {details && <div className="text-sm mt-1">{details}</div>}
          </div>
        )}
      </div>
    </div>
  )
}