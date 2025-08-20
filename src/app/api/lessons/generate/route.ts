// src/app/api/lessons/generate/route.ts
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
    const { curriculumId, subjectId, unitId, chapterId, lessonId } = body
    
    if (!curriculumId || !lessonId) {
      return NextResponse.json(
        { success: false, error: 'curriculumId and lessonId are required' },
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
    let subjectName = ''
    
    for (const subject of curriculumData.subjects) {
      if (subjectId && subject.subjectId !== subjectId) continue
      
      for (const unit of subject.units) {
        if (unitId && unit.unitId !== unitId) continue
        
        for (const chapter of unit.chapters) {
          if (chapterId && chapter.chapterId !== chapterId) continue
          
          const lesson = chapter.lessons.find((l: any) => l.lessonId === lessonId)
          if (lesson) {
            lessonData = lesson
            subjectName = subject.name
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
    
    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    // Prepare student profile for AI service
    const aiStudentProfile = {
      userId: session.user.id,
      skillProfile: studentProfile?.skillProfile as any || {},
      learningPreferences: studentProfile?.learningPreferences as any || {
        style: 'simplified',
        tutorPersona: {
          name: 'Professor Ahmed',
          gender: 'male'
        }
      }
    }
    
    // Generate lesson using AI service
    const generatedLesson = await AIService.generateLesson({
      lessonId: lessonData.lessonId,
      lessonName: lessonData.name,
      objectives: lessonData.objectives,
      keywords: lessonData.keywords,
      studentProfile: aiStudentProfile,
      subject: subjectName,
      grade: curriculumData.grade
    })
    
    // TODO: Cache the generated lesson for future use
    // This could be implemented with Redis or database caching
    
    return NextResponse.json({
      success: true,
      data: {
        lesson: generatedLesson,
        curriculum: {
          id: curriculumId,
          country: curriculumData.country,
          grade: curriculumData.grade,
          subject: subjectName
        },
        generatedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Error generating lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

