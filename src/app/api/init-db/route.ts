// src/app/api/init-db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Database initialization API. Use POST to run migrations and seed data.' 
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database initialization with Prisma...')
    
    // Test database connection
    await db.$connect()
    console.log('Database connection successful')
    
    // Check if tables exist by trying to count users
    try {
      const userCount = await db.user.count()
      console.log(`Database already initialized. Found ${userCount} users.`)
      
      // Check for curriculum table
      const curriculumCount = await db.curriculum.count()
      console.log(`Found ${curriculumCount} curricula.`)
      
      return NextResponse.json({ 
        message: 'Database already initialized successfully',
        stats: {
          users: userCount,
          curricula: curriculumCount
        }
      })
    } catch (error) {
      // If tables don't exist, this is expected for first run
      console.log('Database tables not found, this appears to be first initialization')
      
      return NextResponse.json({ 
        message: 'Database connection successful. Run Prisma migrations to create tables.',
        instructions: 'Use `npx prisma migrate deploy` to create database schema'
      })
    }
    
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to database', 
        details: error instanceof Error ? error.message : 'Unknown error',
        instructions: 'Check DATABASE_URL environment variable and database connectivity'
      },
      { status: 500 }
    )
  } finally {
    await db.$disconnect()
  }
}