// src/app/api/curriculum/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Retrieve specific curriculum by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const curriculum = await db.curriculum.findUnique({
      where: { id },
      select: {
        id: true,
        countryCode: true,
        createdAt: true,
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
    
    return NextResponse.json({
      success: true,
      data: curriculum
    })

  } catch (error) {
    console.error('Error fetching curriculum:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch curriculum',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove curriculum by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Check if curriculum exists
    const existingCurriculum = await db.curriculum.findUnique({
      where: { id }
    })
    
    if (!existingCurriculum) {
      return NextResponse.json(
        {
          success: false,
          error: 'Curriculum not found',
          details: `No curriculum found with ID: ${id}`
        },
        { status: 404 }
      )
    }
    
    // Delete curriculum
    await db.curriculum.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Curriculum deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting curriculum:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete curriculum',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

