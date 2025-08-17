// src/app/api/init-db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API is working. Please use POST to initialize database.' 
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database initialization...')
    
    // Create users table
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
    
    // Create accounts table
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
    
    // Create sessions table
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT UNIQUE,
        userId TEXT,
        expires DATETIME
      )
    `
    
    // Create verificationTokens table
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS verificationTokens (
        identifier TEXT,
        token TEXT,
        expires DATETIME,
        PRIMARY KEY (identifier, token)
      )
    `
    
    // Create studentProfiles table
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

    console.log('Database initialization completed successfully')
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}