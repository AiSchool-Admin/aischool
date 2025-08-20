// src/components/ProfileManager.tsx
'use client'

import { useState, useEffect } from 'react'
import { User, Settings, BookOpen, TrendingUp, Save } from 'lucide-react'

interface StudentProfile {
  id: string
  userId: string
  skillProfile: Record<string, {
    masteryScore: number
    confidence: 'low' | 'medium' | 'high'
    lastAttempt: string
    interactionHistory: Array<{
      timestamp: string
      action: string
      masteryScore: number
    }>
  }>
  learningPreferences: {
    style: 'academic' | 'simplified' | 'humorous'
    tutorPersona: {
      name: string
      gender: 'male' | 'female'
    }
  }
  user: {
    name: string
    email: string
    image?: string
  }
  createdAt: string
  updatedAt: string
}

export default function ProfileManager() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'preferences' | 'progress'>('preferences')

  // Form state
  const [learningStyle, setLearningStyle] = useState<'academic' | 'simplified' | 'humorous'>('simplified')
  const [tutorName, setTutorName] = useState('')
  const [tutorGender, setTutorGender] = useState<'male' | 'female'>('male')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        setLearningStyle(data.data.learningPreferences?.style || 'simplified')
        setTutorName(data.data.learningPreferences?.tutorPersona?.name || 'Professor Ahmed')
        setTutorGender(data.data.learningPreferences?.tutorPersona?.gender || 'male')
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learningPreferences: {
            style: learningStyle,
            tutorPersona: {
              name: tutorName,
              gender: tutorGender
            }
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        setSuccessMessage('Preferences saved successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(data.error || 'Failed to save preferences')
      }
    } catch (err) {
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMasteryColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.6) return 'bg-yellow-500'
    if (score >= 0.4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              {profile?.user.image ? (
                <img 
                  src={profile.user.image} 
                  alt={profile.user.name} 
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.user.name}</h1>
              <p className="text-gray-600">{profile?.user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Learning Preferences
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Learning Progress
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customize Your Learning Experience</h3>
                
                {/* Learning Style */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Learning Style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="learningStyle"
                        value="academic"
                        checked={learningStyle === 'academic'}
                        onChange={(e) => setLearningStyle(e.target.value as 'academic')}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        learningStyle === 'academic' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <h4 className="font-medium text-gray-900">Academic</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Formal language with detailed explanations and theoretical background
                        </p>
                      </div>
                    </label>
                    
                    <label className="relative">
                      <input
                        type="radio"
                        name="learningStyle"
                        value="simplified"
                        checked={learningStyle === 'simplified'}
                        onChange={(e) => setLearningStyle(e.target.value as 'simplified')}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        learningStyle === 'simplified' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <h4 className="font-medium text-gray-900">Simplified</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Clear, simple language with analogies and practical examples
                        </p>
                      </div>
                    </label>
                    
                    <label className="relative">
                      <input
                        type="radio"
                        name="learningStyle"
                        value="humorous"
                        checked={learningStyle === 'humorous'}
                        onChange={(e) => setLearningStyle(e.target.value as 'humorous')}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        learningStyle === 'humorous' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <h4 className="font-medium text-gray-900">Humorous</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Engaging content with appropriate humor and fun examples
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tutor Persona */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Virtual Tutor
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Tutor Name</label>
                      <input
                        type="text"
                        value={tutorName}
                        onChange={(e) => setTutorName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Professor Ahmed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Gender</label>
                      <select
                        value={tutorGender}
                        onChange={(e) => setTutorGender(e.target.value as 'male' | 'female')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={savePreferences}
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  
                  {successMessage && (
                    <p className="text-green-600 text-sm">{successMessage}</p>
                  )}
                  
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Learning Progress</h3>
                
                {profile?.skillProfile && Object.keys(profile.skillProfile).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(profile.skillProfile).map(([lessonId, skill]) => (
                      <div key={lessonId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-900">{lessonId}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(skill.confidence)}`}>
                            {skill.confidence} confidence
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Mastery Level</span>
                            <span>{Math.round(skill.masteryScore * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getMasteryColor(skill.masteryScore)}`}
                              style={{ width: `${skill.masteryScore * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {skill.lastAttempt && (
                          <p className="text-xs text-gray-500">
                            Last activity: {new Date(skill.lastAttempt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No learning progress yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start taking lessons to see your progress here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

