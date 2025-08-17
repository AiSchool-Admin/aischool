// src/app/api/init-db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  console.log('GET request received')
  return NextResponse.json({ 
    message: 'API is working. Please use POST to initialize database.' 
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received - Starting database initialization...')
    
    // Test database connection first
    console.log('Testing database connection...')
    await db.$executeRaw`SELECT 1`
    console.log('Database connection successful')
    
    // Create users table
    console.log('Creating users table...')
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        emailVerified TEXT,
        image TEXT,
        role TEXT DEFAULT 'student',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('Users table created successfully')
    
    // Create accounts table
    console.log('Creating accounts table...')
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        userId TEXT,
        type TEXT,
        provider TEXT,
        providerAccountId TEXT,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT
      )
    `
    console.log('Accounts table created successfully')
    
    // Create sessions table
    console.log('Creating sessions table...')
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT UNIQUE,
        userId TEXT,
        expires DATETIME
      )
    `
    console.log('Sessions table created successfully')
    
    // Create verificationTokens table
    console.log('Creating verificationTokens table...')
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS verificationTokens (
        identifier TEXT,
        token TEXT,
        expires DATETIME,
        PRIMARY KEY (identifier, token)
      )
    `
    console.log('VerificationTokens table created successfully')
    
    // Create studentProfiles table
    console.log('Creating studentProfiles table...')
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS studentProfiles (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE,
        grade TEXT,
        school TEXT,
        interests TEXT,
        learningStyle TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('StudentProfiles table created successfully')

    console.log('Database initialization completed successfully')
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize database', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}