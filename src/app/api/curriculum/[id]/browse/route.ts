// src/app/api/curriculum/[id]/browse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Browse curriculum structure with optional filtering
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subject')
    const unitId = searchParams.get('unit')
    const chapterId = searchParams.get('chapter')
    const level = searchParams.get('level') || 'subjects' // subjects, units, chapters, lessons
    
    const curriculum = await db.curriculum.findUnique({
      where: { id },
      select: {
        id: true,
        countryCode: true,
        data: true,
      }
    })
    
    if (!curriculum) {
      return NextResponse.json(
        {
          success: false,
          error: 'Curriculum not found',
          details: `No curriculum found with ID: ${id}`
        },
        { status: 404 }
      )
    }
    
    const curriculumData = curriculum.data as any
    
    // Filter based on query parameters
    let result: any = {
      curriculumId: id,
      country: curriculumData.country,
      grade: curriculumData.grade,
    }
    
    if (level === 'subjects' && !subjectId) {
      // Return all subjects
      result.subjects = curriculumData.subjects.map((subject: any) => ({
        subjectId: subject.subjectId,
        name: subject.name,
        unitCount: subject.units.length,
        chapterCount: subject.units.reduce((acc: number, unit: any) => acc + unit.chapters.length, 0),
        lessonCount: subject.units.reduce((acc: number, unit: any) => 
          acc + unit.chapters.reduce((chapterAcc: number, chapter: any) => chapterAcc + chapter.lessons.length, 0), 0)
      }))
    } else if (subjectId && !unitId) {
      // Return units for specific subject
      const subject = curriculumData.subjects.find((s: any) => s.subjectId === subjectId)
      if (!subject) {
        return NextResponse.json(
          { success: false, error: 'Subject not found' },
          { status: 404 }
        )
      }
      
      result.subject = {
        subjectId: subject.subjectId,
        name: subject.name
      }
      result.units = subject.units.map((unit: any) => ({
        unitId: unit.unitId,
        name: unit.name,
        chapterCount: unit.chapters.length,
        lessonCount: unit.chapters.reduce((acc: number, chapter: any) => acc + chapter.lessons.length, 0)
      }))
    } else if (subjectId && unitId && !chapterId) {
      // Return chapters for specific unit
      const subject = curriculumData.subjects.find((s: any) => s.subjectId === subjectId)
      if (!subject) {
        return NextResponse.json(
          { success: false, error: 'Subject not found' },
          { status: 404 }
        )
      }
      
      const unit = subject.units.find((u: any) => u.unitId === unitId)
      if (!unit) {
        return NextResponse.json(
          { success: false, error: 'Unit not found' },
          { status: 404 }
        )
      }
      
      result.subject = { subjectId: subject.subjectId, name: subject.name }
      result.unit = { unitId: unit.unitId, name: unit.name }
      result.chapters = unit.chapters.map((chapter: any) => ({
        chapterId: chapter.chapterId,
        name: chapter.name,
        lessonCount: chapter.lessons.length
      }))
    } else if (subjectId && unitId && chapterId) {
      // Return lessons for specific chapter
      const subject = curriculumData.subjects.find((s: any) => s.subjectId === subjectId)
      if (!subject) {
        return NextResponse.json(
          { success: false, error: 'Subject not found' },
          { status: 404 }
        )
      }
      
      const unit = subject.units.find((u: any) => u.unitId === unitId)
      if (!unit) {
        return NextResponse.json(
          { success: false, error: 'Unit not found' },
          { status: 404 }
        )
      }
      
      const chapter = unit.chapters.find((c: any) => c.chapterId === chapterId)
      if (!chapter) {
        return NextResponse.json(
          { success: false, error: 'Chapter not found' },
          { status: 404 }
        )
      }
      
      result.subject = { subjectId: subject.subjectId, name: subject.name }
      result.unit = { unitId: unit.unitId, name: unit.name }
      result.chapter = { chapterId: chapter.chapterId, name: chapter.name }
      result.lessons = chapter.lessons.map((lesson: any) => ({
        lessonId: lesson.lessonId,
        name: lesson.name,
        objectives: lesson.objectives,
        keywords: lesson.keywords,
        dependencies: lesson.dependencies
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error browsing curriculum:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to browse curriculum',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

