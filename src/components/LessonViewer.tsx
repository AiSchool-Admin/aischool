// src/components/LessonViewer.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Target, BookOpen, HelpCircle, CheckCircle, XCircle } from 'lucide-react'

interface Lesson {
  lessonId: string
  name: string
  objectives: string[]
  keywords: string[]
}

interface GeneratedLesson {
  lessonId: string
  title: string
  content: string
  summary: string
  keyPoints: string[]
  estimatedDuration: number
}

interface Question {
  question: string
  type: 'multiple-choice' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface LessonViewerProps {
  curriculumId: string
  subjectId: string
  unitId: string
  chapterId: string
  lessonId: string
  lesson: Lesson
  onBack: () => void
}

export default function LessonViewer({ 
  curriculumId, 
  subjectId, 
  unitId, 
  chapterId, 
  lessonId, 
  lesson, 
  onBack 
}: LessonViewerProps) {
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuestions, setShowQuestions] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [questionResults, setQuestionResults] = useState<Record<number, boolean>>({})

  useEffect(() => {
    generateLesson()
  }, [lessonId])

  const generateLesson = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curriculumId,
          subjectId,
          unitId,
          chapterId,
          lessonId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedLesson(data.data.lesson)
        // Update skill profile to track lesson view
        updateSkillProfile(lessonId, undefined, undefined)
      } else {
        setError(data.error || 'Failed to generate lesson')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = async (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    try {
      setQuestionsLoading(true)
      
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curriculumId,
          lessonId,
          difficulty,
          count: 3
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.data.questions)
        setShowQuestions(true)
        setCurrentQuestionIndex(0)
        setSelectedAnswers({})
        setShowResults(false)
        setQuestionResults({})
      } else {
        setError(data.error || 'Failed to generate questions')
      }
    } catch (err) {
      setError('Failed to generate questions')
    } finally {
      setQuestionsLoading(false)
    }
  }

  const updateSkillProfile = async (lessonId: string, isCorrect?: boolean, masteryScore?: number) => {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          isCorrect,
          masteryScore
        })
      })
    } catch (err) {
      console.error('Failed to update skill profile:', err)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const submitAnswers = () => {
    const results: Record<number, boolean> = {}
    let correctCount = 0
    
    questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index]
      const isCorrect = userAnswer === question.correctAnswer
      results[index] = isCorrect
      if (isCorrect) correctCount++
    })
    
    setQuestionResults(results)
    setShowResults(true)
    
    // Update skill profile based on performance
    const masteryScore = correctCount / questions.length
    updateSkillProfile(lessonId, undefined, masteryScore)
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-gray-900">{line.substring(2)}</h1>
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mt-5 mb-3 text-gray-800">{line.substring(3)}</h2>
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium mt-4 mb-2 text-gray-700">{line.substring(4)}</h3>
        } else if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>
        } else if (line.trim() === '') {
          return <br key={index} />
        } else {
          return <p key={index} className="mb-3 text-gray-700 leading-relaxed">{line}</p>
        }
      })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to curriculum
        </button>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating personalized lesson...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to curriculum
        </button>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={generateLesson}
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
      <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to curriculum
      </button>

      {generatedLesson && !showQuestions && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{generatedLesson.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {generatedLesson.estimatedDuration} min read
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {lesson.objectives.length} objectives
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {lesson.keywords.length} key terms
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              {formatContent(generatedLesson.content)}
            </div>

            {/* Key Points */}
            {generatedLesson.keyPoints.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {generatedLesson.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {generatedLesson.summary && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700">{generatedLesson.summary}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-4">
              <button
                onClick={() => generateQuestions('easy')}
                disabled={questionsLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {questionsLoading ? 'Generating...' : 'Practice Questions (Easy)'}
              </button>
              <button
                onClick={() => generateQuestions('medium')}
                disabled={questionsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {questionsLoading ? 'Generating...' : 'Practice Questions (Medium)'}
              </button>
              <button
                onClick={() => generateQuestions('hard')}
                disabled={questionsLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {questionsLoading ? 'Generating...' : 'Practice Questions (Hard)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Section */}
      {showQuestions && questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Practice Questions</h2>
              <button
                onClick={() => setShowQuestions(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Back to lesson
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          <div className="p-6">
            {!showResults ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-start mb-4">
                    <HelpCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {questions[currentQuestionIndex]?.question}
                    </h3>
                  </div>

                  {questions[currentQuestionIndex]?.type === 'multiple-choice' && questions[currentQuestionIndex]?.options && (
                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options!.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={option}
                            checked={selectedAnswers[currentQuestionIndex] === option}
                            onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                            className="mr-3"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {questions[currentQuestionIndex]?.type === 'short-answer' && (
                    <textarea
                      value={selectedAnswers[currentQuestionIndex] || ''}
                      onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={submitAnswers}
                      disabled={Object.keys(selectedAnswers).length < questions.length}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Submit Answers
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Results</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start mb-2">
                        {questionResults[index] ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{question.question}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Your answer: {selectedAnswers[index]}
                          </p>
                          {!questionResults[index] && (
                            <p className="text-sm text-green-600 mt-1">
                              Correct answer: {question.correctAnswer}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 mt-2">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-lg font-medium text-gray-900 mb-4">
                    Score: {Object.values(questionResults).filter(Boolean).length} / {questions.length}
                  </p>
                  <button
                    onClick={() => setShowQuestions(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Back to Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

