// src/app/api/curriculum/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateCurriculum, generateCurriculumId } from '@/lib/curriculum-schema'

// GET - Retrieve all curricula or filter by country/grade
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const grade = searchParams.get('grade')

    let curricula
    
    if (country || grade) {
      // Filter curricula
      const where: any = {}
      if (country) where.countryCode = country.toLowerCase()
      
      curricula = await db.curriculum.findMany({
        where,
        select: {
          id: true,
          countryCode: true,
          createdAt: true,
          data: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Additional filtering by grade if needed (since grade is in JSON data)
      if (grade) {
        curricula = curricula.filter(curriculum => {
          const data = curriculum.data as any
          return data.grade?.toLowerCase().includes(grade.toLowerCase())
        })
      }
    } else {
      // Get all curricula
      curricula = await db.curriculum.findMany({
        select: {
          id: true,
          countryCode: true,
          createdAt: true,
          data: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: curricula,
      count: curricula.length
    })

  } catch (error) {
    console.error('Error fetching curricula:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch curricula',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Upload new curriculum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate curriculum structure
    const curriculumData = validateCurriculum(body)
    
    // Generate curriculum ID
    const curriculumId = generateCurriculumId(curriculumData.country, curriculumData.grade)
    const countryCode = curriculumData.country.toLowerCase()
    
    // Check if curriculum already exists
    const existingCurriculum = await db.curriculum.findUnique({
      where: { id: curriculumId }
    })
    
    if (existingCurriculum) {
      return NextResponse.json(
        {
          success: false,
          error: 'Curriculum already exists',
          details: `Curriculum for ${curriculumData.country} - ${curriculumData.grade} already exists`
        },
        { status: 409 }
      )
    }
    
    // Create new curriculum
    const newCurriculum = await db.curriculum.create({
      data: {
        id: curriculumId,
        countryCode: countryCode,
        data: curriculumData,
      }
    })
    
    // Count subjects, units, chapters, and lessons for statistics
    const stats = {
      subjects: curriculumData.subjects.length,
      units: curriculumData.subjects.reduce((acc, subject) => acc + subject.units.length, 0),
      chapters: curriculumData.subjects.reduce((acc, subject) => 
        acc + subject.units.reduce((unitAcc, unit) => unitAcc + unit.chapters.length, 0), 0),
      lessons: curriculumData.subjects.reduce((acc, subject) => 
        acc + subject.units.reduce((unitAcc, unit) => 
          unitAcc + unit.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lessons.length, 0), 0), 0)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Curriculum uploaded successfully',
      data: {
        id: newCurriculum.id,
        country: curriculumData.country,
        grade: curriculumData.grade,
        stats
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading curriculum:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid curriculum format',
          details: 'The uploaded JSON does not match the required curriculum schema',
          validationErrors: (error as any).errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload curriculum',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update existing curriculum
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Curriculum ID is required' },
        { status: 400 }
      )
    }
    
    // Validate curriculum structure
    const curriculumData = validateCurriculum(body.data)
    
    // Update curriculum
    const updatedCurriculum = await db.curriculum.update({
      where: { id },
      data: {
        data: curriculumData,
        countryCode: curriculumData.country.toLowerCase()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Curriculum updated successfully',
      data: updatedCurriculum
    })

  } catch (error) {
    console.error('Error updating curriculum:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update curriculum',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

