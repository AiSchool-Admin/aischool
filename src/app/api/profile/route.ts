// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Retrieve student profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
    
    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = await db.studentProfile.create({
        data: {
          userId: session.user.id,
          skillProfile: {},
          learningPreferences: {
            style: 'simplified',
            tutorPersona: {
              name: 'Professor Ahmed',
              gender: 'male'
            }
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
      
      return NextResponse.json({
        success: true,
        data: newProfile
      })
    }
    
    return NextResponse.json({
      success: true,
      data: profile
    })
    
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update student profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { learningPreferences, skillProfile } = body
    
    // Validate learning preferences structure
    if (learningPreferences) {
      const validStyles = ['academic', 'simplified', 'humorous']
      if (learningPreferences.style && !validStyles.includes(learningPreferences.style)) {
        return NextResponse.json(
          { success: false, error: 'Invalid learning style' },
          { status: 400 }
        )
      }
    }
    
    // Update profile
    const updatedProfile = await db.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(learningPreferences && { learningPreferences }),
        ...(skillProfile && { skillProfile }),
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        skillProfile: skillProfile || {},
        learningPreferences: learningPreferences || {
          style: 'simplified',
          tutorPersona: {
            name: 'Professor Ahmed',
            gender: 'male'
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Update skill profile for specific lesson
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { lessonId, masteryScore, confidence, isCorrect } = body
    
    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: 'lessonId is required' },
        { status: 400 }
      )
    }
    
    // Get current profile
    const currentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    const currentSkillProfile = (currentProfile?.skillProfile as any) || {}
    const currentLessonData = currentSkillProfile[lessonId] || {
      masteryScore: 0.0,
      confidence: 'low',
      lastAttempt: null,
      interactionHistory: []
    }
    
    // Update mastery score based on performance
    let newMasteryScore = currentLessonData.masteryScore
    if (typeof isCorrect === 'boolean') {
      if (isCorrect) {
        newMasteryScore = Math.min(1.0, newMasteryScore + 0.1)
      } else {
        newMasteryScore = Math.max(0.0, newMasteryScore - 0.05)
      }
    } else if (typeof masteryScore === 'number') {
      newMasteryScore = Math.max(0.0, Math.min(1.0, masteryScore))
    }
    
    // Update confidence based on mastery score
    let newConfidence = confidence || currentLessonData.confidence
    if (!confidence) {
      if (newMasteryScore >= 0.7) newConfidence = 'high'
      else if (newMasteryScore >= 0.4) newConfidence = 'medium'
      else newConfidence = 'low'
    }
    
    // Update skill profile
    const updatedSkillProfile = {
      ...currentSkillProfile,
      [lessonId]: {
        masteryScore: newMasteryScore,
        confidence: newConfidence,
        lastAttempt: new Date().toISOString(),
        interactionHistory: [
          ...(currentLessonData.interactionHistory || []).slice(-9), // Keep last 10 interactions
          {
            timestamp: new Date().toISOString(),
            action: isCorrect !== undefined ? (isCorrect ? 'correct_answer' : 'incorrect_answer') : 'lesson_view',
            masteryScore: newMasteryScore
          }
        ]
      }
    }
    
    // Update profile in database
    const updatedProfile = await db.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        skillProfile: updatedSkillProfile,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        skillProfile: updatedSkillProfile,
        learningPreferences: {
          style: 'simplified',
          tutorPersona: {
            name: 'Professor Ahmed',
            gender: 'male'
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        lessonId,
        skillData: updatedSkillProfile[lessonId]
      },
      message: 'Skill profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating skill profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update skill profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

