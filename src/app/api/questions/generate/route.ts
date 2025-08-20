// src/app/api/questions/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AIService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { curriculumId, lessonId, difficulty = 'medium', count = 3 } = body
    
    if (!curriculumId || !lessonId) {
      return NextResponse.json(
        { success: false, error: 'curriculumId and lessonId are required' },
        { status: 400 }
      )
    }
    
    // Validate difficulty level
    const validDifficulties = ['easy', 'medium', 'hard']
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty level. Must be easy, medium, or hard' },
        { status: 400 }
      )
    }
    
    // Validate count
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: 'Question count must be between 1 and 10' },
        { status: 400 }
      )
    }
    
    // Get curriculum data
    const curriculum = await db.curriculum.findUnique({
      where: { id: curriculumId }
    })
    
    if (!curriculum) {
      return NextResponse.json(
        { success: false, error: 'Curriculum not found' },
        { status: 404 }
      )
    }
    
    // Find the specific lesson in curriculum
    const curriculumData = curriculum.data as any
    let lessonData = null
    
    for (const subject of curriculumData.subjects) {
      for (const unit of subject.units) {
        for (const chapter of unit.chapters) {
          const lesson = chapter.lessons.find((l: any) => l.lessonId === lessonId)
          if (lesson) {
            lessonData = lesson
            break
          }
        }
        if (lessonData) break
      }
      if (lessonData) break
    }
    
    if (!lessonData) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found in curriculum' },
        { status: 404 }
      )
    }
    
    // Get student's skill profile for this lesson
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    const skillProfile = (studentProfile?.skillProfile as any) || {}
    const lessonSkill = skillProfile[lessonId] || { masteryScore: 0, confidence: 'low' }
    
    // Adjust difficulty based on student's mastery level
    let adjustedDifficulty = difficulty
    if (lessonSkill.masteryScore < 0.3 && difficulty === 'hard') {
      adjustedDifficulty = 'medium'
    } else if (lessonSkill.masteryScore > 0.8 && difficulty === 'easy') {
      adjustedDifficulty = 'medium'
    }
    
    // Generate questions using AI service
    const questions = await AIService.generateQuestions(
      lessonId,
      lessonData.name,
      lessonData.objectives,
      adjustedDifficulty as 'easy' | 'medium' | 'hard'
    )
    
    // Limit to requested count
    const limitedQuestions = questions.slice(0, count)
    
    return NextResponse.json({
      success: true,
      data: {
        questions: limitedQuestions,
        lesson: {
          id: lessonId,
          name: lessonData.name,
          objectives: lessonData.objectives
        },
        difficulty: adjustedDifficulty,
        studentMastery: {
          score: lessonSkill.masteryScore,
          confidence: lessonSkill.confidence
        },
        generatedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

