// src/app/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { BookOpen, User, Upload, Settings } from 'lucide-react'
import CurriculumBrowser from '@/components/CurriculumBrowser'
import LessonViewer from '@/components/LessonViewer'
import ProfileManager from '@/components/ProfileManager'

type ViewType = 'dashboard' | 'curriculum' | 'lesson' | 'profile' | 'upload'

interface LessonData {
  curriculumId: string
  subjectId: string
  unitId: string
  chapterId: string
  lessonId: string
  lesson: {
    lessonId: string
    name: string
    objectives: string[]
    keywords: string[]
  }
}

export default function Home() {
  const { data: session } = useSession()
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [selectedLesson, setSelectedLesson] = useState<LessonData | null>(null)

  const handleLessonSelect = (curriculumId: string, subjectId: string, unitId: string, chapterId: string, lessonId: string, lesson: any) => {
    setSelectedLesson({
      curriculumId,
      subjectId,
      unitId,
      chapterId,
      lessonId,
      lesson
    })
    setCurrentView('lesson')
  }

  const handleBackToCurriculum = () => {
    setCurrentView('curriculum')
    setSelectedLesson(null)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'curriculum':
        return <CurriculumBrowser onLessonSelect={handleLessonSelect} />
      case 'lesson':
        return selectedLesson ? (
          <LessonViewer
            curriculumId={selectedLesson.curriculumId}
            subjectId={selectedLesson.subjectId}
            unitId={selectedLesson.unitId}
            chapterId={selectedLesson.chapterId}
            lessonId={selectedLesson.lessonId}
            lesson={selectedLesson.lesson}
            onBack={handleBackToCurriculum}
          />
        ) : null
      case 'profile':
        return <ProfileManager />
      case 'upload':
        return <CurriculumUpload />
      default:
        return <Dashboard onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="text-xl font-bold text-blue-600 hover:text-blue-800"
                >
                  AiSchool
                </button>
              </div>
              {session && (
                <nav className="hidden md:flex space-x-8 ml-10">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      currentView === 'dashboard' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('curriculum')}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      currentView === 'curriculum' || currentView === 'lesson'
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Learn
                  </button>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      currentView === 'profile' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <User className="w-4 h-4 mr-1" />
                    Profile
                  </button>
                </nav>
              )}
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
        {renderContent()}
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

// Dashboard Component
function Dashboard({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to AiSchool
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              An AI-powered learning platform that adapts to your unique learning style
            </p>
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user?.name}!
          </h2>
          <p className="text-gray-600">
            Continue your personalized learning journey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            onClick={() => onNavigate('curriculum')}
            className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Browse Curriculum</h3>
            </div>
            <p className="text-gray-600">
              Explore subjects, units, and lessons tailored to your learning needs
            </p>
          </div>

          <div
            onClick={() => onNavigate('profile')}
            className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Manage Profile</h3>
            </div>
            <p className="text-gray-600">
              Customize your learning preferences and track your progress
            </p>
          </div>

          <div
            onClick={() => onNavigate('upload')}
            className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center mb-4">
              <Upload className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Curriculum</h3>
            </div>
            <p className="text-gray-600">
              Add new curriculum content to expand the learning library
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Curriculum Upload Component
function CurriculumUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid JSON file')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)
      setMessage(null)

      const fileContent = await file.text()
      const curriculumData = JSON.parse(fileContent)

      const response = await fetch('/api/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(curriculumData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Curriculum uploaded successfully! Added ${data.data.stats.subjects} subjects with ${data.data.stats.lessons} lessons.`)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Failed to upload curriculum')
      }
    } catch (err) {
      setError('Invalid JSON file or upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Curriculum</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Curriculum JSON File
          </label>
          <input
            id="file-input"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Curriculum'}
        </button>

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}