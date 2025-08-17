// src/app/api/init-db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API is working. Please use POST to initialize database.' 
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database initialization with SQLite...')
    
    // Ensure data directory exists
    const dataDir = '/opt/render/project/data'
    try {
      await mkdir(dataDir, { recursive: true })
      console.log('Data directory created/verified:', dataDir)
    } catch (error) {
      console.log('Data directory already exists or error creating it:', error.message)
    }
    
    const dbPath = '/opt/render/project/data/aischool.db'
    console.log('Using database path:', dbPath)
    
    // Import SQLite dynamically
    const sqlite3 = await import('sqlite3')
    const { open } = await import('sqlite')
    
    // Open database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.default.Database
    })
    
    console.log('Database connection successful')
    
    // Create tables
    console.log('Creating users table...')
    await db.exec(`
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
    `)
    
    console.log('Creating accounts table...')
    await db.exec(`
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
    `)
    
    console.log('Creating sessions table...')
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT UNIQUE,
        userId TEXT,
        expires DATETIME
      )
    `)
    
    console.log('Creating verificationTokens table...')
    await db.exec(`
      CREATE TABLE IF NOT EXISTS verificationTokens (
        identifier TEXT,
        token TEXT,
        expires DATETIME,
        PRIMARY KEY (identifier, token)
      )
    `)
    
    console.log('Creating studentProfiles table...')
    await db.exec(`
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
    `)

    await db.close()
    
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