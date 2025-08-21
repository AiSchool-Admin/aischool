// This will be a test page without authentication
'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')

  const testClaude = async () => {
    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curriculumId: 'test',
          subjectId: 'math',
          unitId: 'algebra',
          chapterId: 'basics',
          lessonId: 'introduction'
        })
      })
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error: ' + error.message)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>AiSchool Test Page</h1>
      <button onClick={testClaude}>Test Claude AI</button>
      <pre>{result}</pre>
    </div>
  )
}
