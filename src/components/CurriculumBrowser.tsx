// src/components/CurriculumBrowser.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, BookOpen, FileText, Play } from 'lucide-react'

interface Curriculum {
  id: string
  countryCode: string
  data: {
    country: string
    grade: string
    subjects: Subject[]
  }
}

interface Subject {
  subjectId: string
  name: string
  units: Unit[]
}

interface Unit {
  unitId: string
  name: string
  chapters: Chapter[]
}

interface Chapter {
  chapterId: string
  name: string
  lessons: Lesson[]
}

interface Lesson {
  lessonId: string
  name: string
  objectives: string[]
  keywords: string[]
}

interface CurriculumBrowserProps {
  onLessonSelect?: (curriculumId: string, subjectId: string, unitId: string, chapterId: string, lessonId: string, lesson: Lesson) => void
}

export default function CurriculumBrowser({ onLessonSelect }: CurriculumBrowserProps) {
  const [curricula, setCurricula] = useState<Curriculum[]>([])
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurricula()
  }, [])

  const fetchCurricula = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/curriculum')
      const data = await response.json()
      
      if (data.success) {
        setCurricula(data.data)
      } else {
        setError(data.error || 'Failed to load curricula')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleLessonClick = (lesson: Lesson, subjectId: string, unitId: string, chapterId: string) => {
    if (onLessonSelect && selectedCurriculum) {
      onLessonSelect(selectedCurriculum, subjectId, unitId, chapterId, lesson.lessonId, lesson)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading curricula...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchCurricula}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const selectedCurriculumData = curricula.find(c => c.id === selectedCurriculum)
  const selectedSubjectData = selectedCurriculumData?.data.subjects.find(s => s.subjectId === selectedSubject)
  const selectedUnitData = selectedSubjectData?.units.find(u => u.unitId === selectedUnit)
  const selectedChapterData = selectedUnitData?.chapters.find(c => c.chapterId === selectedChapter)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Curriculum</h2>
      
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button 
          onClick={() => {
            setSelectedCurriculum(null)
            setSelectedSubject(null)
            setSelectedUnit(null)
            setSelectedChapter(null)
          }}
          className="hover:text-blue-600"
        >
          Curricula
        </button>
        {selectedCurriculumData && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => {
                setSelectedSubject(null)
                setSelectedUnit(null)
                setSelectedChapter(null)
              }}
              className="hover:text-blue-600"
            >
              {selectedCurriculumData.data.country} - {selectedCurriculumData.data.grade}
            </button>
          </>
        )}
        {selectedSubjectData && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => {
                setSelectedUnit(null)
                setSelectedChapter(null)
              }}
              className="hover:text-blue-600"
            >
              {selectedSubjectData.name}
            </button>
          </>
        )}
        {selectedUnitData && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => setSelectedChapter(null)}
              className="hover:text-blue-600"
            >
              {selectedUnitData.name}
            </button>
          </>
        )}
        {selectedChapterData && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span>{selectedChapterData.name}</span>
          </>
        )}
      </nav>

      {/* Content */}
      <div className="space-y-4">
        {!selectedCurriculum && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {curricula.map((curriculum) => (
              <div
                key={curriculum.id}
                onClick={() => setSelectedCurriculum(curriculum.id)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">{curriculum.data.country}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{curriculum.data.grade}</p>
                <p className="text-xs text-gray-500">
                  {curriculum.data.subjects.length} subjects
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedCurriculumData && !selectedSubject && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedCurriculumData.data.subjects.map((subject) => (
              <div
                key={subject.subjectId}
                onClick={() => setSelectedSubject(subject.subjectId)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                </div>
                <p className="text-xs text-gray-500">
                  {subject.units.length} units
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedSubjectData && !selectedUnit && (
          <div className="space-y-3">
            {selectedSubjectData.units.map((unit) => (
              <div
                key={unit.unitId}
                onClick={() => setSelectedUnit(unit.unitId)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{unit.name}</h3>
                <p className="text-xs text-gray-500">
                  {unit.chapters.length} chapters
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedUnitData && !selectedChapter && (
          <div className="space-y-3">
            {selectedUnitData.chapters.map((chapter) => (
              <div
                key={chapter.chapterId}
                onClick={() => setSelectedChapter(chapter.chapterId)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{chapter.name}</h3>
                <p className="text-xs text-gray-500">
                  {chapter.lessons.length} lessons
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedChapterData && (
          <div className="space-y-3">
            {selectedChapterData.lessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                onClick={() => handleLessonClick(lesson, selectedSubject!, selectedUnit!, selectedChapter!)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Play className="w-4 h-4 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">{lesson.name}</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Objectives:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {lesson.objectives.slice(0, 2).map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                        {lesson.objectives.length > 2 && (
                          <li className="text-gray-500">+{lesson.objectives.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {lesson.keywords.slice(0, 5).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {lesson.keywords.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{lesson.keywords.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

